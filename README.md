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

# Solana Agent Framework

This project provides a framework for building and deploying AI agents on the Solana blockchain. It leverages ReactFlow for a visual, node-based interface, allowing users to create complex workflows involving various agents.

## Features

*   **Visual Workflow Builder:** Design agent interactions using a drag-and-drop interface powered by ReactFlow.
*   **Modular Agent System:** Create and integrate custom agents for various tasks (e.g., data fetching, analysis, trading).
*   **Multi-Agent Systems:** Combine multiple agents to create complex, coordinated workflows.
*   **Solana Integration:** Connect to the Solana blockchain for on-chain data and interactions.
*   **Extensible Architecture:** Easily add new agents and functionalities.
*   **AI-Powered Agents:** Utilize AI models (like OpenAI's GPT) for intelligent decision-making.
*   **Real-time Data:** Fetch and process real-time data from various sources (Twitter, Discord, Telegram, on-chain data).
*   **Trading Capabilities:** Integrate with decentralized exchanges (DEXs) for automated trading.
*   **Web View Integration:** Display external web content (like charts) within the workflow.
*   **Wallet Integration:** Connect with Solana wallets (Phantom, Solflare) for secure transactions.
*   **Error Handling:** Robust error handling and reporting.
*   **Dockerized Deployment:** Easy deployment using Docker and Docker Compose.
*   **Customizable UI:** Highly customizable and configurable user interface.

## Architecture

The project consists of three main components:

1.  **Frontend (React):** Provides the user interface for building and interacting with agent workflows.
2.  **Node.js LLM Service:** Handles the execution of agent logic, including interactions with AI models and external APIs.
3.  **Orchestrator (FastAPI):**  Manages the overall workflow execution and communication between the frontend and backend services.  (Currently, the Node.js service handles orchestration as well, but this is a planned separation of concerns.)

## Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   npm (v9 or later)
*   Docker
*   Docker Compose
*   A Solana wallet (Phantom or Solflare recommended)
*   API keys for:
    *   OpenAI
    *   Twitter (RapidAPI)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/solana-labs/dapp-scaffold.git
    cd dapp-scaffold
    ```
    
2.  **Rename the folder:**
    ```bash
    mv dapp-scaffold solana-agent-framework
    cd solana-agent-framework
    ```

3.  **Install dependencies:**

    ```bash
    cd frontend && npm install
    cd ../node-llm-service && npm install
    ```

4.  **Set up environment variables:**

    Create `.env` files in both the `frontend` and `node-llm-service` directories.  Add the following variables, replacing the placeholders with your actual API keys:

    **`frontend/.env`:**

    ```
    REACT_APP_OPENAI_API_KEY=your_openai_api_key
    ```

    **`node-llm-service/.env`:**

    ```
    OPENAI_API_KEY=your_openai_api_key
    TWITTER_RAPIDAPI_KEY=your_twitter_rapidapi_key
    SOLANA_RPC_URL=your_solana_rpc_url  # (e.g., from QuickNode)
    ```

5.  **Build and run the application:**

    ```bash
    docker-compose up --build
    ```

    This will build and start the frontend, Node.js LLM service, and orchestrator services.

6.  **Access the application:**

    Open your browser and go to `http://localhost:3000`.

## Multi-Agent System Example: Copy Transaction

The "Copy Transaction" feature provides a pre-built multi-agent system that demonstrates the power of combining different agents. This flow allows you to monitor Twitter for potential token mentions, analyze the mentioned tokens, and execute trades based on the analysis.

**Workflow:**

1.  **Twitter KOL List:**  You provide a list of Twitter accounts (KOLs - Key Opinion Leaders) to monitor.
2.  **Twitter Agent:**  This agent fetches tweets from the specified KOLs, using the "CA Mode" (Contract Address Mode) to extract potential Solana token contract addresses.
3.  **Analyst Agent:**  This agent analyzes the extracted contract addresses, checking metrics like market cap, liquidity, and top holders.
4.  **Webview Node:** Displays a chart (e.g., a K-line chart) for the analyzed token.
5.  **Trading Agent:**  Allows you to execute trades (buy/sell) based on the analysis and your configured parameters.

**How to use:**

1.  Click the "Copy Transaction" button in the "Multi-agent Marketplace" section of the sidebar. This will automatically create and connect the necessary nodes on the canvas.
2.  An instruction sticker will appear in the top-left corner, guiding you through the process.
3.  Add Twitter accounts to the "Twitter KOL List" node.
4.  Ensure "CA Mode" is checked in the "Twitter Agent" node.
5.  Set your desired parameters in the "Analyst Agent" node.
6.  Configure your trading settings in the "Trading Agent" node.
7.  Click the "Run Flow" button to start the multi-agent system.

This example showcases how different agents can be combined to create a powerful and automated workflow.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License.