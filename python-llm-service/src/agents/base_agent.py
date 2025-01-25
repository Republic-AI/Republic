from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import os
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI

class BaseAgent(ABC):
    def __init__(self, config: Dict[str, Any]):
        """Initialize the base agent with common configuration."""
        self.config = config
        self.validate_api_keys()
        
        # Initialize LLM with configurable parameters
        api_keys = self.config.get("apiKeys", {})
        self.llm = ChatOpenAI(
            model_name=config.get("model_name", "gpt-3.5-turbo"),
            temperature=config.get("temperature", 0.7),
            max_tokens=config.get("max_tokens", 1000),
            api_key=api_keys.get("openai") or os.getenv("OPENAI_API_KEY")
        )
        
        # Initialize memory
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )

    def validate_api_keys(self):
        """Validate that required API keys are present."""
        api_keys = self.config.get("apiKeys", {})
        missing_keys = []
        
        # Check for OpenAI API key
        if not (api_keys.get("openai") or os.getenv("OPENAI_API_KEY")):
            missing_keys.append("OPENAI_API_KEY")
        
        if missing_keys:
            raise ValueError(f"Missing required API keys: {', '.join(missing_keys)}")

    @abstractmethod
    async def execute(self, user_input: str) -> Dict[str, Any]:
        """Execute the agent's main functionality.
        
        Args:
            user_input: The input from the user to process
            
        Returns:
            Dict containing the execution results
        """
        pass

    async def cleanup(self):
        """Clean up any resources used by the agent."""
        # Base implementation - can be overridden by subclasses
        if hasattr(self, 'memory'):
            await self.memory.clear() 