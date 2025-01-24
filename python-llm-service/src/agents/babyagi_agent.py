from typing import Dict, Any, List
import os
from dotenv import load_dotenv
from langchain import LLMChain, OpenAI, PromptTemplate
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.docstore import InMemoryDocstore
from collections import deque
import numpy as np
import asyncio
from .base_agent import BaseAgent

load_dotenv()

class BabyAGIAgent(BaseAgent):
    def __init__(self, config: Dict[str, Any]):
        """Initialize BabyAGI agent with vector store and task chains."""
        super().__init__(config)
        
        # Initialize embeddings and vector store
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma(
            collection_name="tasks",
            embedding_function=self.embeddings
        )
        
        # Initialize task chains
        self.task_creation_chain = self._create_task_creation_chain()
        self.task_prioritization_chain = self._create_task_prioritization_chain()
        self.execution_chain = self._create_execution_chain()
        
        # Initialize task lists
        self.task_list = []
        self.completed_tasks = []
        self.task_id_counter = 0

    def _create_task_creation_chain(self) -> LLMChain:
        """Create the chain for generating new tasks."""
        prompt = PromptTemplate(
            input_variables=["result", "task_description", "incomplete_tasks", "completed_tasks"],
            template="""You are an AI task creation agent. Based on the result of the last task and the current task list, create new tasks to be completed that will help achieve the original objective.

Last task result: {result}
Current task: {task_description}
Incomplete tasks: {incomplete_tasks}
Completed tasks: {completed_tasks}

Create new tasks that are needed. Return only the new tasks, one per line."""
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    def _create_task_prioritization_chain(self) -> LLMChain:
        """Create the chain for prioritizing tasks."""
        prompt = PromptTemplate(
            input_variables=["task_names"],
            template="""You are an AI task prioritization agent. You have the following tasks:

{task_names}

Prioritize these tasks based on:
1. Dependencies between tasks
2. Complexity and time required
3. Impact on achieving the overall objective

Return the tasks in prioritized order, one per line."""
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    def _create_execution_chain(self) -> LLMChain:
        """Create the chain for executing tasks."""
        prompt = PromptTemplate(
            input_variables=["objective", "task"],
            template="""You are an AI task execution agent. Your objective is: {objective}

Your current task is: {task}

Execute this task and provide a detailed response that can be used for future tasks.
Include any relevant information, insights, or conclusions."""
        )
        return LLMChain(llm=self.llm, prompt=prompt)

    async def execute(self, user_input: str) -> Dict[str, Any]:
        """Execute the BabyAGI agent's main loop."""
        objective = user_input
        results = []
        
        # Create initial task
        self.task_list.append({
            "id": self.task_id_counter,
            "name": "Analyze objective and create initial tasks",
            "description": f"Analyze the objective: {objective} and break it down into initial tasks"
        })
        self.task_id_counter += 1
        
        # Main loop
        while self.task_list and len(results) < self.config.get("max_iterations", 5):
            # Get next task
            current_task = self.task_list.pop(0)
            
            # Execute task
            execution_result = await self.execution_chain.arun(
                objective=objective,
                task=current_task["description"]
            )
            
            # Store result
            results.append({
                "task": current_task,
                "result": execution_result
            })
            self.completed_tasks.append(current_task)
            
            # Create new tasks
            new_tasks = await self.task_creation_chain.arun(
                result=execution_result,
                task_description=current_task["description"],
                incomplete_tasks="\n".join(t["name"] for t in self.task_list),
                completed_tasks="\n".join(t["name"] for t in self.completed_tasks)
            )
            
            # Add new tasks
            for task in new_tasks.split("\n"):
                task = task.strip()
                if task:
                    self.task_list.append({
                        "id": self.task_id_counter,
                        "name": task,
                        "description": task
                    })
                    self.task_id_counter += 1
            
            # Prioritize tasks
            if self.task_list:
                prioritized_tasks = await self.task_prioritization_chain.arun(
                    task_names="\n".join(t["name"] for t in self.task_list)
                )
                
                # Reorder task list based on prioritization
                priority_dict = {task.strip(): i for i, task in enumerate(prioritized_tasks.split("\n"))}
                self.task_list.sort(key=lambda x: priority_dict.get(x["name"], float("inf")))
            
            # Store tasks in vector store for future reference
            if execution_result:
                self.vectorstore.add_texts(
                    texts=[execution_result],
                    metadatas=[{"task": current_task["name"]}]
                )
        
        return {
            "objective": objective,
            "completed_tasks": self.completed_tasks,
            "results": results,
            "remaining_tasks": self.task_list
        }

    async def cleanup(self):
        """Clean up resources used by the BabyAGI agent."""
        await super().cleanup()  # Call parent cleanup
        if hasattr(self, 'vectorstore'):
            self.vectorstore.delete_collection()
        self.task_list = []
        self.completed_tasks = []
        self.task_id_counter = 0 