from langchain.agents import Tool, AgentExecutor, initialize_agent, AgentType
from langchain.prompts import StringPromptTemplate
from langchain.llms import OpenAI
from langchain.chains import LLMChain
from langchain.tools.ddg_search import DuckDuckGoSearchRun
from langchain.tools.wikipedia.tool import WikipediaQueryRun
from langchain.memory import ConversationBufferMemory
from langchain.schema import AgentAction, AgentFinish
from typing import List, Union, Dict, Any
import re
import os
from dotenv import load_dotenv
from langchain.utilities import GoogleSearchAPIWrapper, WikipediaAPIWrapper
from langchain.tools import ShellTool
from .base_agent import BaseAgent
import subprocess

load_dotenv()

class LangChainAgent(BaseAgent):
    def __init__(self, config: Dict[str, Any]):
        """Initialize LangChain agent with tools and agent executor."""
        super().__init__(config)
        
        # Initialize memory
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # Initialize tools
        self.tools = self._initialize_tools()
        
        # Initialize agent
        self.agent = initialize_agent(
            tools=self.tools,
            llm=self.llm,
            agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
            memory=self.memory,
            verbose=self.config.get("verbose", True)
        )

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
            
        # Wikipedia tool
        wiki = WikipediaAPIWrapper()
        tools.append(
            Tool(
                name="wikipedia",
                func=wiki.run,
                description="Search Wikipedia for information"
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

    async def execute(self, user_input: str) -> Dict[str, Any]:
        """Execute the LangChain agent with the given input."""
        try:
            # Run the agent
            response = await self.agent.arun(input=user_input)
            
            return {
                "response": response,
                "thought_process": self.agent.agent.llm_prefix if hasattr(self.agent.agent, "llm_prefix") else None
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "thought_process": self.agent.agent.llm_prefix if hasattr(self.agent.agent, "llm_prefix") else None
            }

    async def cleanup(self):
        """Clean up resources used by the LangChain agent."""
        await super().cleanup()  # Call parent cleanup 