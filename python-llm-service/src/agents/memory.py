from typing import Dict, Any, List
from langchain.memory import BufferMemory

class ConversationMemory:
    def __init__(self, window_size: int = 5):
        self.memory = BufferMemory(
            memory_key="chat_history",
            return_messages=True,
            max_token_limit=window_size * 200  # Approximate token limit based on window size
        )
        
    async def loadMemoryVariables(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Load memory variables."""
        return await self.memory.load_memory_variables(inputs)
        
    async def saveContext(self, inputs: Dict[str, Any], outputs: Dict[str, Any]):
        """Save context from this conversation turn."""
        await self.memory.save_context(inputs, outputs)
        
    async def clear(self):
        """Clear memory contents."""
        await self.memory.clear()

class EmotionalMemory(ConversationMemory):
    def __init__(self, window_size: int = 5):
        super().__init__(window_size)
        # Initialize emotional state (valence, arousal, dominance)
        self.valence = 0.0  # negative to positive
        self.arousal = 0.0  # calm to excited
        self.dominance = 0.0  # submissive to dominant
        self.alpha = 0.3  # learning rate for emotional state updates
        
        # Define emotional keywords
        self.positive_words = {'happy', 'good', 'great', 'wonderful', 'excited', 'love'}
        self.negative_words = {'sad', 'bad', 'terrible', 'angry', 'hate', 'afraid'}
        self.aroused_words = {'excited', 'angry', 'passionate', 'energetic', 'anxious'}
        self.calm_words = {'peaceful', 'relaxed', 'calm', 'quiet', 'serene'}
        self.dominant_words = {'must', 'should', 'will', 'definitely', 'always'}
        self.submissive_words = {'maybe', 'perhaps', 'might', 'sometimes', 'possibly'}
        
    async def saveContext(self, inputs: Dict[str, Any], outputs: Dict[str, Any]):
        """Save context and update emotional state."""
        await super().saveContext(inputs, outputs)
        
        # Update emotional state based on input
        if 'input' in inputs:
            self.updateEmotionalState(inputs['input'].lower())
            
    def updateEmotionalState(self, text: str):
        """Update emotional state based on input text."""
        words = set(text.split())
        
        # Calculate emotional impacts
        valence_impact = (
            len(words & self.positive_words) - 
            len(words & self.negative_words)
        ) * 0.2
        
        arousal_impact = (
            len(words & self.aroused_words) - 
            len(words & self.calm_words)
        ) * 0.2
        
        dominance_impact = (
            len(words & self.dominant_words) - 
            len(words & self.submissive_words)
        ) * 0.2
        
        # Update states with smoothing
        self.valence = (1 - self.alpha) * self.valence + self.alpha * valence_impact
        self.arousal = (1 - self.alpha) * self.arousal + self.alpha * arousal_impact
        self.dominance = (1 - self.alpha) * self.dominance + self.alpha * dominance_impact
        
        # Clamp values between -1 and 1
        self.valence = max(-1.0, min(1.0, self.valence))
        self.arousal = max(-1.0, min(1.0, self.arousal))
        self.dominance = max(-1.0, min(1.0, self.dominance))
        
    def getEmotionalSummary(self) -> Dict[str, float]:
        """Get current emotional state."""
        return {
            'valence': self.valence,
            'arousal': self.arousal,
            'dominance': self.dominance
        }
        
    def getMoodLabel(self) -> str:
        """Get a text label for the current mood."""
        if self.valence > 0.3:
            if self.arousal > 0.3:
                return "excited and positive"
            elif self.arousal < -0.3:
                return "content and peaceful"
            else:
                return "generally positive"
        elif self.valence < -0.3:
            if self.arousal > 0.3:
                return "agitated and negative"
            elif self.arousal < -0.3:
                return "depressed and withdrawn"
            else:
                return "generally negative"
        else:
            if self.arousal > 0.3:
                return "aroused but neutral"
            elif self.arousal < -0.3:
                return "calm and neutral"
            else:
                return "neutral" 