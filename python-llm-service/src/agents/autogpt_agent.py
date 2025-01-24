from typing import List, Dict, Any
import os
import json
import subprocess
from langchain.tools import Tool
from langchain.utilities import GoogleSearchAPIWrapper
from langchain.agents import Tool
from langchain.tools import ShellTool
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from .base_agent import BaseAgent

class AutoGPTAgent(BaseAgent):
    def __init__(self, config: Dict[str, Any]):
        """Initialize AutoGPT agent with tools and chains."""
        super().__init__(config)
        self.tools = self._initialize_tools()
        self.planning_chain = self._create_planning_chain()
        self.execution_chain = self._create_execution_chain()
        self.reflection_chain = self._create_reflection_chain()
        self.state = {
            "goals": [],
            "current_task": None,
            "completed_tasks": [],
            "reflections": []
        }

    def _initialize_tools(self) -> List[Tool]:
        """Initialize available tools for the agent."""
        tools = []
        
        # Web search tool
        if os.getenv("GOOGLE_API_KEY") and os.getenv("GOOGLE_CSE_ID"):
            search = GoogleSearchAPIWrapper()
            tools.append(
                Tool(
                    name="web_search",
                    func=search.run,
                    description="Search the web for information"
                )
            )
            
        # File operations tool
        tools.append(
            Tool(
                name="write_file",
                func=self._safe_write_file,
                description="Write content to a file safely"
            )
        )
        
        tools.append(
            Tool(
                name="read_file",
                func=self._safe_read_file,
                description="Read content from a file safely"
            )
        )
        
        # Shell command tool (with safety checks)
        shell_tool = ShellTool()
        tools.append(
            Tool(
                name="shell",
                func=self._safe_shell_command,
                description="Execute shell commands safely"
            )
        )
        
        return tools

    def _create_planning_chain(self) -> LLMChain:
        """Create the planning chain for determining next actions."""
        planning_prompt = PromptTemplate(
            input_variables=["goals", "completed_tasks", "current_task"],
            template="""Given these goals: {goals}
            Completed tasks: {completed_tasks}
            Current task: {current_task}
            
            What should be the next action? Consider:
            1. Breaking down complex goals into smaller tasks
            2. Using available tools effectively
            3. Maintaining progress toward the goals
            
            Respond with a specific next action and its rationale."""
        )
        return LLMChain(llm=self.llm, prompt=planning_prompt)

    def _create_execution_chain(self) -> LLMChain:
        """Create the execution chain for carrying out actions."""
        execution_prompt = PromptTemplate(
            input_variables=["action", "tools", "previous_result"],
            template="""Action to execute: {action}
            Available tools: {tools}
            Previous result: {previous_result}
            
            How should this action be executed using the available tools?
            Provide a specific plan using the tools."""
        )
        return LLMChain(llm=self.llm, prompt=execution_prompt)

    def _create_reflection_chain(self) -> LLMChain:
        """Create the reflection chain for evaluating results."""
        reflection_prompt = PromptTemplate(
            input_variables=["action", "result", "goals"],
            template="""Action taken: {action}
            Result: {result}
            Goals: {goals}
            
            Evaluate the result and suggest improvements or next steps.
            Consider:
            1. Was the action successful?
            2. What was learned?
            3. What could be done differently?
            4. How does this contribute to the goals?"""
        )
        return LLMChain(llm=self.llm, prompt=reflection_prompt)

    async def execute(self, user_input: str) -> Dict[str, Any]:
        """Execute the AutoGPT agent's main loop."""
        # Initialize goals from user input
        self.state["goals"] = self._parse_goals(user_input)
        results = []
        
        while len(self.state["completed_tasks"]) < len(self.state["goals"]):
            # Plan next action
            planning_result = await self.planning_chain.arun(
                goals=self.state["goals"],
                completed_tasks=self.state["completed_tasks"],
                current_task=self.state["current_task"]
            )
            
            # Execute action
            execution_result = await self.execution_chain.arun(
                action=planning_result,
                tools=self.tools,
                previous_result=results[-1] if results else None
            )
            
            # Reflect on results
            reflection = await self.reflection_chain.arun(
                action=planning_result,
                result=execution_result,
                goals=self.state["goals"]
            )
            
            # Update state
            self.state["completed_tasks"].append(planning_result)
            self.state["reflections"].append(reflection)
            results.append(execution_result)
            
            # Break if max iterations reached or all goals completed
            if len(results) >= self.config.get("max_iterations", 5):
                break
        
        return {
            "goals": self.state["goals"],
            "completed_tasks": self.state["completed_tasks"],
            "reflections": self.state["reflections"],
            "results": results
        }

    def _parse_goals(self, user_input: str) -> List[str]:
        """Parse user input into a list of goals."""
        # Simple implementation - split by newlines or semicolons
        goals = [g.strip() for g in user_input.replace('\n', ';').split(';')]
        return [g for g in goals if g]  # Remove empty goals

    def _safe_write_file(self, args: str) -> str:
        """Safely write content to a file."""
        try:
            path, content = args.split(':', 1)
            safe_path = os.path.basename(path)  # Only allow writing to current directory
            with open(safe_path, 'w') as f:
                f.write(content)
            return f"Successfully wrote to {safe_path}"
        except Exception as e:
            return f"Error writing file: {str(e)}"

    def _safe_read_file(self, path: str) -> str:
        """Safely read content from a file."""
        try:
            safe_path = os.path.basename(path)  # Only allow reading from current directory
            with open(safe_path, 'r') as f:
                return f.read()
        except Exception as e:
            return f"Error reading file: {str(e)}"

    def _safe_shell_command(self, command: str) -> str:
        """Safely execute shell commands."""
        # List of allowed commands
        allowed_commands = ['ls', 'pwd', 'echo', 'cat']
        
        # Parse command to get the base command
        base_command = command.split()[0]
        
        if base_command not in allowed_commands:
            return f"Command '{base_command}' is not allowed for security reasons"
            
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=5  # 5 second timeout
            )
            return result.stdout if result.returncode == 0 else result.stderr
        except Exception as e:
            return f"Error executing command: {str(e)}"

    async def cleanup(self):
        """Clean up resources used by the AutoGPT agent."""
        await super().cleanup()  # Call parent cleanup
        self.state = {
            "goals": [],
            "current_task": None,
            "completed_tasks": [],
            "reflections": []
        } 