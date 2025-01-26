# Republic - AI Agent Orchestration Platform

![Republic AI Agent Orchestration Platform](image.png)

A powerful visual flow-based platform for orchestrating AI agents. Republic enables you to create, connect, and manage sophisticated AI agent workflows through an intuitive drag-and-drop interface, supporting multiple agent frameworks and seamless integration with various AI services.

## 🌟 Key Features

### Visual Flow Editor
- Intuitive drag-and-drop interface
- Real-time flow visualization
- Dynamic node connections
- Live preview of agent configurations
- Custom node styling and grouping

### Agent Frameworks

#### 🔍 LangChain Agent
A flexible, general-purpose language model agent:

- **Key Features**
  - Tool-using capabilities
  - Web search integration
  - Document analysis
  - Memory management
  - Chain-of-thought reasoning
  
- **Use Cases**
  - Research and analysis
  - Content generation
  - Question answering
  - Data extraction
  - Process automation

#### 🤓 AutoGPT Agent
An autonomous agent capable of breaking down and executing complex tasks:

- **Core Features**
  - Goal-oriented task execution
  - Self-prompted task planning
  - Tool utilization
  - Long-term memory
  - Recursive task refinement
  
- **Capabilities**
  - Web research
  - Content creation
  - Code generation
  - Data analysis
  - Project planning

#### 👶 BabyAGI Agent
A task management and execution agent focused on iterative improvement:

- **Key Features**
  - Task prioritization
  - Objective breakdown
  - Result analysis
  - Vector memory storage
  - Learning optimization
  
- **Applications**
  - Project planning
  - Research organization
  - Learning optimization
  - Knowledge management
  - Process improvement

#### 🤖 Eliza Agent Framework
A sophisticated conversational agent inspired by the classic ELIZA program, enhanced with modern AI capabilities:

- **Personality & Adaptation**
  - Configurable personality traits
  - Dynamic emotional state tracking
  - Context-aware responses
  - Adaptive conversation styles
  - Memory-based personalization
  
- **Advanced Features**
  - Pattern-based response generation
  - Emotional memory system
  - Conversation history analysis
  - Multi-turn dialogue management
  - Natural language understanding
  
- **Integration Capabilities**
  - Discord bot functionality
  - Twitter API integration
  - Telegram bot support
  - Custom webhook support
  - Real-time event handling

#### 🚀 ZerePy Agent Framework
A versatile social media management and engagement agent:

- **Core Capabilities**
  - Multi-platform content creation
  - Engagement strategy optimization
  - Audience analysis and insights
  - Content scheduling
  - Performance analytics
  
- **Platform Support**
  - Twitter engagement and analytics
  - Farcaster social protocol integration
  - Discord community management
  - Cross-platform coordination
  - API rate limit handling
  
- **Smart Features**
  - Content performance tracking
  - Automated response generation
  - Engagement pattern analysis
  - Sentiment analysis
  - Trend detection

## 🛠 Setup

### Prerequisites
- Docker and Docker Compose
- Node.js v18+ (for local development only)
- Python 3.8+ (for local development only)
- API Keys:
  - OpenAI API key (required for GPT models)
  - Anthropic API key (optional for Claude models)
  - Platform-specific API keys (as needed)

### API Key Configuration

There are two ways to configure API keys:

1. **Node Configuration (Recommended)**
   - Each AI agent node has a dedicated API key field in its configuration
   - API keys are stored securely and used only for specific nodes
   - Configure keys in node settings under "AI Model Configuration"
   - Supports per-node API key rotation and management

2. **Environment Variables (Alternative)**
   - Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here
   ```
   - These will be used as fallback if no API key is provided in node configuration
   - Supports global API key management

Note: For security, API keys in node configurations are encrypted at rest and masked in the UI.

### Installation

#### Option 1: Using Docker (Recommended)

1. **Clone the Repository**
```bash
git clone https://github.com/Republic-AI/Republic.git
cd republic
```

2. **Configure Environment**
Create a `.env` file in the root directory with your API keys and configuration.

3. **Build and Run with Docker Compose**
```bash
docker-compose build
docker-compose up -d
```

4. **Access the Application**
- Frontend UI: http://localhost:3000
- orchestrator API: http://localhost:8080
- Python LLM Service: http://localhost:5001
- Node LLM Service: http://localhost:5002

To stop the services:
```bash
docker-compose down
```

#### Option 2: Local Development

1. **Install Dependencies**

Frontend:
```bash
cd frontend
npm install
npm start
```
Frontend will be available at http://localhost:3000

orchestrator:
```bash
cd orchestrator
npm install
npm start
```
orchestrator will run on http://localhost:8080

Node LLM Service:
```bash
cd node-llm-service
npm install
npm start
```
Node LLM Service will run on http://localhost:5002

Python LLM Service:
```bash
cd python-llm-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Python LLM Service will run on http://localhost:5001

## 📚 Usage Examples

### 1. Therapeutic Conversation Flow
```javascript
{
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
}
```

### 2. Web3 Content Creation and Distribution
```javascript
{
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
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

For detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## 💬 Support

- GitHub Issues: Bug reports and feature requests
- Documentation: [docs/](./docs)
- Community: [Discord](https://discord.gg/republic)
- Email: support@republic.ai

## 🔮 Roadmap

- [ ] Additional agent frameworks
  - [ ] ReAct Agent integration
  - [ ] Plan-and-Execute Agent
  - [ ] Multi-Agent collaboration
- [ ] Enhanced memory systems
  - [ ] Distributed vector storage
  - [ ] Cross-agent memory sharing
  - [ ] Long-term memory optimization
- [ ] Custom plugin development
  - [ ] Plugin marketplace
  - [ ] Custom tool creation
  - [ ] Third-party integrations
- [ ] Advanced workflow templates
  - [ ] Industry-specific templates
  - [ ] Best practice patterns
  - [ ] Template marketplace
- [ ] Multi-user collaboration
  - [ ] Real-time flow editing
  - [ ] Version control
  - [ ] Team workspaces
- [ ] Enterprise features
  - [ ] Role-based access control
  - [ ] Audit logging
  - [ ] Custom deployment options
  - [ ] SLA guarantees