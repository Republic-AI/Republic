import re
from typing import Dict, Any, List, Tuple
import random

class PatternMatcher:
    def __init__(self):
        # Define patterns for various types of statements
        self.patterns = [
            # Self-reflection patterns
            {
                'pattern': r'\b(i am|i'm)\s+([^.!?]*)',
                'type': 'self_reflection',
                'responses': [
                    "Why do you say you are {}?",
                    "How long have you been {}?",
                    "How do you feel about being {}?",
                    "What makes you think you are {}?"
                ]
            },
            # Emotional expression patterns
            {
                'pattern': r'\b(i feel|i am feeling)\s+([^.!?]*)',
                'type': 'emotion',
                'responses': [
                    "Tell me more about feeling {}.",
                    "What makes you feel {}?",
                    "How often do you feel {}?",
                    "When did you start feeling {}?"
                ]
            },
            # Desire patterns
            {
                'pattern': r'\b(i want|i wish|i'd like)\s+([^.!?]*)',
                'type': 'desire',
                'responses': [
                    "What would it mean to you if you got {}?",
                    "Why do you want {}?",
                    "What would you do if you got {}?",
                    "How long have you wanted {}?"
                ]
            },
            # Belief patterns
            {
                'pattern': r'\b(i think|i believe|i feel that)\s+([^.!?]*)',
                'type': 'belief',
                'responses': [
                    "Why do you think {}?",
                    "What makes you believe {}?",
                    "Are you sure that {}?",
                    "What evidence do you have that {}?"
                ]
            },
            # Absolute statements
            {
                'pattern': r'\b(always|never|everyone|nobody)\b\s*([^.!?]*)',
                'type': 'absolute',
                'responses': [
                    "Can you think of any exceptions to {}?",
                    "Is it really true that {}?",
                    "Have there been times when this wasn't true: {}?",
                    "What makes you say {}?"
                ]
            },
            # Reasoning patterns
            {
                'pattern': r'\b(because|since|therefore)\s+([^.!?]*)',
                'type': 'reasoning',
                'responses': [
                    "Is that the only reason {}?",
                    "What other factors led to {}?",
                    "How certain are you that {}?",
                    "Could there be other explanations besides {}?"
                ]
            },
            # Family/relationship patterns
            {
                'pattern': r'\b(my mother|my father|my sister|my brother|my friend)\s+([^.!?]*)',
                'type': 'relationship',
                'responses': [
                    "Tell me more about your relationship with your {}.",
                    "How does {} make you feel?",
                    "How long has {} been this way?",
                    "What would {} say about this?"
                ]
            }
        ]
        
        # Default responses for when no pattern matches
        self.default_responses = [
            "Can you tell me more about that?",
            "How does that make you feel?",
            "What do you think that means?",
            "Let's explore that further.",
            "What comes to mind when you think about this?",
            "Could you elaborate on that?"
        ]
        
    def findMatch(self, input: str) -> Tuple[str, str, str]:
        """Find a matching pattern in the input."""
        input = input.lower()
        
        for pattern in self.patterns:
            match = re.search(pattern['pattern'], input)
            if match:
                # Get the matched content
                matched_content = match.group(2)
                return pattern['type'], matched_content, random.choice(pattern['responses'])
                
        return 'default', input, random.choice(self.default_responses)
        
    def formatResponse(self, template: str, match: str) -> str:
        """Format the response template with the matched content."""
        return template.format(match)
        
    def getResponse(self, input: str, config: Dict[str, Any] = {}) -> str:
        """Get a response based on the input and configuration."""
        # Get reflection and empathy levels
        reflection_level = config.get('reflection_level', 5)
        empathy_level = config.get('empathy_level', 5)
        
        # Find matching pattern and response template
        match_type, matched_content, response_template = self.findMatch(input)
        
        # Determine if we should use reflection or empathy
        if reflection_level > random.randint(1, 10):
            # Use pattern-based response
            response = self.formatResponse(response_template, matched_content)
        else:
            # Use more direct response
            response = self.getRandomResponse(match_type)
            
        # Add empathetic prefix based on empathy level
        if empathy_level > random.randint(1, 10):
            response = self.addEmpathicPrefix(match_type) + response
            
        return response
        
    def getRandomResponse(self, match_type: str) -> str:
        """Get a random response based on the type of match."""
        type_responses = {
            'self_reflection': [
                "Let's talk more about how you see yourself.",
                "Your self-perception is interesting.",
                "That's a meaningful observation about yourself."
            ],
            'emotion': [
                "Emotions can be complex.",
                "It's important to acknowledge our feelings.",
                "Your feelings are valid."
            ],
            'desire': [
                "Goals and wishes are important to explore.",
                "Let's understand what drives your desires.",
                "What steps could you take toward this?"
            ],
            'belief': [
                "Our beliefs shape our reality.",
                "That's an interesting perspective.",
                "What led you to this belief?"
            ],
            'absolute': [
                "Life often has nuances.",
                "There might be some exceptions worth considering.",
                "That's a strong statement."
            ],
            'reasoning': [
                "Your logic is interesting.",
                "Let's explore your reasoning.",
                "What other factors might be involved?"
            ],
            'relationship': [
                "Relationships play a big role in our lives.",
                "That sounds like an important relationship.",
                "How does this relationship affect you?"
            ]
        }
        
        responses = type_responses.get(match_type, self.default_responses)
        return random.choice(responses)
        
    def addEmpathicPrefix(self, match_type: str) -> str:
        """Add an empathetic prefix based on the type of match."""
        prefixes = {
            'self_reflection': "I appreciate you sharing that. ",
            'emotion': "I can sense that this is meaningful to you. ",
            'desire': "It's natural to have such wishes. ",
            'belief': "Thank you for sharing your perspective. ",
            'absolute': "I understand this feels very clear to you. ",
            'reasoning': "I follow your thinking. ",
            'relationship': "Relationships can be complex. ",
            'default': "I hear you. "
        }
        
        return prefixes.get(match_type, prefixes['default']) 