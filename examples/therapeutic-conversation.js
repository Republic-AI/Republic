// Therapeutic Conversation Flow
// This example demonstrates a mental health support workflow that combines 
// empathetic conversation with research-backed suggestions.

const flow = {
  "nodes": [
    {
      "id": "input",
      "type": "input",
      "data": {
        "text": "I've been feeling overwhelmed with work lately and having trouble sleeping."
      }
    },
    {
      "id": "eliza",
      "type": "eliza",
      "data": {
        "config": {
          "agentName": "Dr. Eliza",
          "agentRole": "empathetic",
          "conversationStyle": "therapeutic",
          "reflectionLevel": 8,
          "modelConfig": {
            "foundationModel": "gpt-4",
            "modelParams": {
              "temperature": 0.7,
              "maxTokens": 2000
            }
          }
        }
      }
    },
    {
      "id": "langchain",
      "type": "langchain",
      "data": {
        "config": {
          "tools": ["search", "wikipedia"],
          "modelConfig": {
            "foundationModel": "gpt-4",
            "modelParams": {
              "temperature": 0.5
            }
          },
          "maxIterations": 3,
          "toolsConfig": {
            "search": {
              "type": "serpapi"
            }
          }
        }
      }
    },
    {
      "id": "output",
      "type": "output",
      "data": {
        "format": "structured"
      }
    }
  ],
  "edges": [
    {"source": "input", "target": "eliza"},
    {"source": "eliza", "target": "langchain"},
    {"source": "langchain", "target": "output"}
  ]
};

// Example response format
const exampleResponse = {
  "conversation": {
    "empathetic_response": "I hear how overwhelming work has been for you, and I understand that sleep difficulties can make everything feel even more challenging. Can you tell me more about what's been contributing to feeling overwhelmed?",
    "analysis": {
      "emotional_state": "stressed, overwhelmed",
      "key_concerns": ["work pressure", "sleep issues"],
      "suggested_focus": "work-life balance"
    }
  },
  "research": {
    "sleep_recommendations": [
      "Maintain consistent sleep schedule",
      "Create relaxing bedtime routine",
      "Limit screen time before bed"
    ],
    "stress_management": [
      "Regular exercise",
      "Mindfulness practices",
      "Time management techniques"
    ]
  }
}; 