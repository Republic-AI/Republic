from typing import Dict, Any, List
import os
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from .base_agent import BaseAgent
from zerepy import ZerePyAgent as BaseZerePyAgent
from zerepy.memory import AdvancedMemory
from zerepy.platforms import TwitterPlatform, DiscordPlatform
from dotenv import load_dotenv

load_dotenv()

class ZerePyAgent(BaseAgent):
    def __init__(self, config: Dict[str, Any]):
        """Initialize ZerePy agent with conversation chain."""
        super().__init__(config)
        
        # Initialize conversation chain
        self.conversation_chain = self._create_conversation_chain()
        
        # Initialize state
        self.context = ""
        self.conversation_history = []
        
        # Initialize base ZerePy agent
        self.agent = BaseZerePyAgent(
            name=config.get('agent_name', 'ZerePy'),
            bio=config.get('agent_bio', 'Social media management agent'),
            traits=config.get('traits', ['engaging', 'analytical']),
            task_weights=config.get('task_weights', {
                'content_creation': 0.4,
                'engagement': 0.3,
                'analysis': 0.3
            })
        )
        
        # Initialize memory system
        self.memory = AdvancedMemory()
        
        # Initialize social platforms
        self.platforms = {}
        if config and config.get('social_platforms'):
            for platform in config['social_platforms']:
                if platform == 'twitter' and os.getenv('TWITTER_API_KEY'):
                    self.platforms['twitter'] = TwitterPlatform(
                        api_key=os.getenv('TWITTER_API_KEY'),
                        api_secret=os.getenv('TWITTER_API_SECRET'),
                        access_token=os.getenv('TWITTER_ACCESS_TOKEN'),
                        access_token_secret=os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
                    )
                elif platform == 'discord' and os.getenv('DISCORD_TOKEN'):
                    self.platforms['discord'] = DiscordPlatform(
                        token=os.getenv('DISCORD_TOKEN'),
                        channels=config.get('discord_channels', [])
                    )

    def _create_conversation_chain(self) -> LLMChain:
        """Create the conversation chain for the agent."""
        prompt = PromptTemplate(
            input_variables=["context", "history", "input"],
            template="""You are ZerePy, a helpful AI assistant focused on Python programming.
            
Current context: {context}

Conversation history:
{history}

User: {input}

Think about your response:
1. If it's a programming question, provide clear, accurate code examples
2. If it's a conceptual question, explain thoroughly but concisely
3. Always maintain a helpful and professional tone
"""
        )
        return LLMChain(prompt=prompt)

    async def execute(self, input_text):
        try:
            # Load memory context
            context = await self.memory.load_context()
            
            # Process input through ZerePy agent
            result = await self.agent.process(
                input_text,
                context=context,
                platforms=self.platforms
            )
            
            # Save to memory
            await self.memory.save_context(
                input_values={'input': input_text},
                output_values={'output': result.content}
            )
            
            # Post to social platforms if configured
            social_results = []
            if self.platforms:
                for platform_name, platform in self.platforms.items():
                    try:
                        post_result = await platform.post(result.content)
                        social_results.append({
                            'platform': platform_name,
                            'success': True,
                            **post_result
                        })
                    except Exception as e:
                        social_results.append({
                            'platform': platform_name,
                            'success': False,
                            'error': str(e)
                        })
            
            return {
                'content': result.content,
                'social_results': social_results,
                'analysis': result.analysis
            }
            
        except Exception as e:
            raise Exception(f"Error executing ZerePy agent: {str(e)}") 