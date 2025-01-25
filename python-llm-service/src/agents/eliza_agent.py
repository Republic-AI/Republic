from typing import Dict, Any, List
from .base_agent import BaseAgent
from .memory import ConversationMemory, EmotionalMemory
from .pattern_matcher import PatternMatcher

class ElizaAgent(BaseAgent):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        
        # Initialize personality attributes
        self.name = config.get('therapistName', 'Eliza')
        self.role = config.get('therapistRole', 'Rogerian')
        self.style = config.get('conversationStyle', 'Empathetic')
        
        # Initialize response style attributes
        self.reflection_level = config.get('reflectionLevel', 7)
        self.empathy_level = config.get('empathyLevel', 8)
        
        # Initialize memory and pattern matcher
        self.memory = self.initializeMemory(config)
        self.pattern_matcher = PatternMatcher()
        
        # Initialize social platforms
        self.social_platforms = self.initializeSocialPlatforms(config)
        
    def initializeMemory(self, config: Dict[str, Any]) -> Any:
        """Initialize the appropriate memory type based on configuration."""
        memory_type = config.get('memoryType', 'emotional')
        context_window = config.get('contextWindow', 5)
        
        if memory_type == 'emotional':
            return EmotionalMemory(window_size=context_window)
        else:
            return ConversationMemory(window_size=context_window)
            
    def initializeSocialPlatforms(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Initialize configured social platform integrations."""
        platforms = {}
        
        if 'twitter' in config.get('platforms', {}):
            from ..platforms import TwitterPlatform
            platforms['twitter'] = TwitterPlatform(config['platforms']['twitter'])
            
        if 'discord' in config.get('platforms', {}):
            from ..platforms import DiscordPlatform
            platforms['discord'] = DiscordPlatform(config['platforms']['discord'])
            
        return platforms
            
    async def execute(self, input: str) -> Dict[str, Any]:
        """Execute the Eliza agent with the given input."""
        try:
            # Load conversation history
            history = await self.memory.loadMemoryVariables({})
            
            # Generate response based on input and history
            response = self.generateResponse(input, history)
            
            # Post to configured social platforms if enabled
            social_responses = {}
            for platform_name, platform in self.social_platforms.items():
                try:
                    result = await platform.post(response['content'])
                    social_responses[platform_name] = result
                except Exception as e:
                    social_responses[platform_name] = {
                        'error': str(e),
                        'success': False
                    }
            
            # Save context
            await self.memory.saveContext(
                {"input": input},
                {"output": response}
            )
            
            return {
                "content": response['content'],
                "metadata": {
                    "role": self.role,
                    "style": self.style,
                    "reflection_level": self.reflection_level,
                    "empathy_level": self.empathy_level,
                    "social_responses": social_responses
                }
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "content": "I'm having trouble processing that. Could you rephrase it?"
            }
            
    def generateResponse(self, input: str, history: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a response based on input and conversation history."""
        # Get pattern-based response
        response = self.pattern_matcher.getResponse(
            input,
            {
                "reflection_level": self.reflection_level,
                "empathy_level": self.empathy_level
            }
        )
        
        # Format response based on personality
        return {
            'content': self.formatResponse(response),
            'type': response.get('type', 'default')
        }
        
    def formatResponse(self, response: str) -> str:
        """Format the response based on the agent's personality."""
        prefix = ""
        
        if self.role == "Rogerian":
            prefix = "I hear that "
        elif self.role == "Cognitive-Behavioral":
            prefix = "Let's examine "
        elif self.role == "Psychodynamic":
            prefix = "It seems that "
        elif self.role == "Humanistic":
            prefix = "I understand "
            
        return f"{prefix}{response}"
        
    async def cleanup(self):
        """Clean up resources."""
        if self.memory:
            await self.memory.clear() 