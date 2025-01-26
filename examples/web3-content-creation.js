// Web3 Content Creation and Distribution Flow
// This example demonstrates a workflow for creating and distributing Web3 content
// across multiple platforms with community engagement.

const flow = {
  "nodes": [
    {
      "id": "input",
      "type": "input",
      "data": {
        "text": "Create engaging content about the latest DeFi trends and distribute across Web3 social platforms."
      }
    },
    {
      "id": "autogpt",
      "type": "autogpt",
      "data": {
        "config": {
          "modelConfig": {
            "foundationModel": "gpt-4",
            "modelParams": {
              "temperature": 0.8,
              "maxTokens": 2000
            }
          },
          "maxIterations": 5,
          "tools": ["search", "wikipedia"],
          "goals": [
            "Research latest DeFi trends",
            "Analyze market sentiment",
            "Identify key innovations",
            "Create platform-specific content"
          ]
        }
      }
    },
    {
      "id": "zerepy",
      "type": "zerepy",
      "data": {
        "config": {
          "agentName": "CryptoInfluencer",
          "agentBio": "Web3 content creator and DeFi analyst",
          "traits": ["analytical", "engaging", "tech-savvy"],
          "taskWeights": {
            "contentCreation": 0.5,
            "engagement": 0.3,
            "analysis": 0.2
          },
          "socialPlatforms": ["farcaster", "twitter"],
          "modelConfig": {
            "foundationModel": "gpt-4",
            "modelParams": {
              "temperature": 0.7
            }
          }
        }
      }
    },
    {
      "id": "eliza",
      "type": "eliza",
      "data": {
        "config": {
          "agentName": "CommunityManager",
          "agentRole": "community",
          "conversationStyle": "professional",
          "reflectionLevel": 6,
          "socialPlatforms": {
            "discord": {
              "enabled": true,
              "channels": ["defi-discussion", "market-analysis"],
              "autoPost": true
            }
          },
          "modelConfig": {
            "foundationModel": "gpt-4",
            "modelParams": {
              "temperature": 0.6
            }
          }
        }
      }
    }
  ],
  "edges": [
    {"source": "input", "target": "autogpt"},
    {"source": "autogpt", "target": "zerepy"},
    {"source": "zerepy", "target": "eliza"}
  ]
};

// Example response format
const exampleResponse = {
  "research": {
    "trends": [
      "Real-world asset tokenization",
      "Layer 2 scaling solutions",
      "DeFi 2.0 innovations"
    ],
    "market_sentiment": {
      "overall": "bullish",
      "key_metrics": {
        "tvl": "growing",
        "user_adoption": "steady increase"
      }
    }
  },
  "content": {
    "twitter": [
      {
        "text": "🔥 DeFi is evolving! RWA tokenization is revolutionizing traditional finance...",
        "thread": true,
        "engagement_metrics": {
          "likes": 245,
          "retweets": 89
        }
      }
    ],
    "farcaster": [
      {
        "text": "Deep dive into L2 scaling solutions and their impact on DeFi adoption...",
        "channel": "defi-tech",
        "engagement": "high"
      }
    ],
    "discord": {
      "announcements": "New research report on DeFi trends now available!",
      "discussion_topics": [
        "RWA tokenization benefits",
        "L2 scaling comparison"
      ]
    }
  },
  "community_engagement": {
    "response_rate": "95%",
    "sentiment": "positive",
    "active_discussions": 12
  }
}; 