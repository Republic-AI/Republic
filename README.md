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

#### 🤖 Eliza Agent Framework
- **Content & Strategy**
  - Advanced content planning and creation
  - Strategic decision-making capabilities
  - Document analysis and synthesis
  
- **Tools & Integration**
  - Web search and research capabilities
  - Document processing and management
  - Code execution and analysis
  - File system operations
  
- **Memory Systems**
  - Retrievable memory for context retention
  - Document store for knowledge management
  - Conversation history tracking
  
- **Client Integration**
  - Discord bot integration
  - Twitter API support
  - Telegram bot capabilities

#### 🚀 ZerePy Agent Framework
- **Social Platform Integration**
  - Twitter engagement and analytics
  - Farcaster social protocol support
  - Discord community management
  - Echo Chambers integration
  
- **Blockchain Capabilities**
  - Multi-chain support
  - Smart contract interaction
  - Web3 protocol integration
  
- **Advanced Features**
  - GOAT plugin system
  - Task prioritization with weights
  - Time-based execution scheduling
  - Performance analytics and reporting
  
- **Configuration Options**
  - Agent personality traits
  - Task management preferences
  - Engagement strategies
  - Response templating

#### 🔗 Additional Agent Types
- **LangChain Agent**: General-purpose language model integration
- **AutoGPT Agent**: Autonomous task execution
- **BabyAGI Agent**: Task management and planning

### Input/Output System
- **Input Types**
  - Text input with formatting
  - File upload support
  - API endpoint integration
  - Structured data parsing
  
- **Output Formats**
  - JSON/XML/YAML formatting
  - API response handling
  - File export capabilities
  - Custom format templates

## 🛠 Setup

### Prerequisites
- Node.js v18+
- Docker and Docker Compose
- API Keys:
  - OpenAI API key
  - Anthropic API key (for Claude models)
  - Social platform API keys (as needed)

### Quick Start

1. **Clone & Setup**
```bash
git clone https://github.com/yourusername/republic.git
cd republic
cp .env.example .env
```

2. **Configure Environment**
Edit `.env` with your API keys and preferences:
```env
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
DISCORD_BOT_TOKEN=your_token_here
# Add other API keys as needed
```

3. **Launch**
```bash
docker-compose up -d
```

Access the platform at `http://localhost:3000`

## 📚 Usage Examples

### 1. Content Creation & Distribution Flow
```javascript
{
  "nodes": [
    {
      "id": "input",
      "type": "input",
      "data": {
        "text": "Create viral tech content about AI trends"
      }
    },
    {
      "id": "eliza",
      "type": "eliza",
      "data": {
        "config": {
          "agentName": "Content Strategist",
          "systemPrompt": "You are an expert tech content creator",
          "tools": ["web-search", "document-interaction"]
        }
      }
    },
    {
      "id": "zerepy",
      "type": "zerepy",
      "data": {
        "config": {
          "socialPlatforms": ["twitter", "farcaster"],
          "traits": ["engaging", "analytical"],
          "taskWeights": {
            "distribution": 0.6,
            "engagement": 0.4
          }
        }
      }
    },
    {
      "id": "output",
      "type": "output",
      "data": {
        "format": "json"
      }
    }
  ],
  "edges": [
    {"source": "input", "target": "eliza"},
    {"source": "eliza", "target": "zerepy"},
    {"source": "zerepy", "target": "output"}
  ]
}
```

### 2. Research & Analysis Flow
See more examples in the [examples](./examples) directory.

## 🏗 Architecture

### Core Components
- **Frontend**: React-based flow editor with real-time updates
- **Orchestrator**: Node.js service for workflow management
- **Agent Services**: Specialized services for each agent framework
- **Memory System**: Distributed storage for agent state and data

### Data Flow
1. User creates workflow in visual editor
2. Orchestrator validates and processes flow
3. Agents execute in sequence with data passing
4. Results collected and formatted for output

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## 💬 Support

- GitHub Issues: Bug reports and feature requests
- Documentation: [docs/](./docs)
- Community: [Discord](https://discord.gg/republic)

## 🔮 Roadmap

- [ ] Additional agent frameworks
- [ ] Enhanced memory systems
- [ ] Custom plugin development
- [ ] Advanced workflow templates
- [ ] Multi-user collaboration
- [ ] Enterprise features

---

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Services](#services)
   - [Python LLM Service](#python-llm-service)
   - [Node.js LLM Service](#nodejs-llm-service)
   - [Orchestrator](#orchestrator)
   - [Frontend](#frontend-react-flow)
4. [Requirements](#requirements)
5. [Quick Start (Docker Compose)](#quick-start-docker-compose)
6. [Local Setup (Without Docker)](#local-setup-without-docker)
7. [Usage](#usage)
8. [Extend and Customize](#extend-and-customize)
9. [License](#license)

---

## Overview

- **Goal**: Show how to combine multiple AI microservices (in Python, Node.js, etc.) behind an orchestrator, with a **visual drag-and-drop** interface for building a flow of AI calls.
- **Why**: You may have AI logic in different languages or frameworks. By exposing each service via HTTP, you can chain them together in a flexible pipeline. The front-end (React Flow) lets users visually define the flow, and the orchestrator executes it in the correct sequence.
- **Features**:
  - Each microservice calls **OpenAI API** via LangChain (Python or JS).
  - **Orchestrator** performs topological sorting of nodes and sequentially invokes each service's `/run` endpoint.
  - **React Flow** in the front-end for node-based workflow editing.

---

## Architecture

Below is a simplified schematic:
+——————+    +——————+    +———————+
| Python LLM       |    | Node.js LLM      |    |   Other AI Services |
| (Flask+LangChain)|    | (Express+Langchain.js) |   (Optional)       |
|   /run endpoint  |    |   /run endpoint  |    | /run endpoint       |
+——————+    +——————+    +———————+
^                       ^                       ^
|    HTTP calls        |                       |
+–––––+———–+———–+———–+
|                       |
v                       v
+——————————+
|        Orchestrator         |
| (Node.js, executes flow)    |
+–––––––+—————+
|
|  HTTP /execute-flow
v
+—————————+
|        Frontend          |
|    (React + React Flow)  |
+—————————+

1. **Python LLM Service** and **Node.js LLM Service** each provide a `/run` endpoint.  
2. **Orchestrator** receives a JSON graph of nodes and edges from the front-end, calls the microservices in the appropriate order, and forwards results from one node to the next.  
3. **Frontend** uses **React Flow** to let you drag nodes (representing each microservice), connect them with edges, and define input parameters (e.g., prompt text).

---

## Services

### Python LLM Service

- **Location**: `python-llm-service/`
- **Tech**: Python + Flask + LangChain
- **Endpoint**: `POST /run`
- **Description**: Demonstrates how to call OpenAI from Python using LangChain. Expects an `input` string in JSON, returns a JSON with a `result` string.

### Node.js LLM Service

- **Location**: `node-llm-service/`
- **Tech**: Node.js + Express + Langchain.js
- **Endpoint**: `POST /run`
- **Description**: Demonstrates how to call OpenAI from Node.js using LangChain (JavaScript version). Expects an `input` string, returns `result`.

### Orchestrator

- **Location**: `orchestrator/`
- **Tech**: Node.js + Express + Axios
- **Endpoint**: `POST /execute-flow`
- **Description**: Receives the graph (nodes + edges) from the front-end, calls each microservice in sequence. Supports a placeholder `{PREV_RESULT}` to insert the output from the previous node.

### Frontend (React Flow)

- **Location**: `frontend/`
- **Tech**: React + React Flow + Axios
- **Description**: Lets you drag and edit nodes, then sends the final flow to the Orchestrator.  
- **Default Port**: 80 (if Docker), or 3000/5173 (local dev), depending on your tooling.

---

## Requirements

- **OpenAI API Key**: You need a valid key from [OpenAI](https://platform.openai.com/) to call GPT-3.5, GPT-4, etc.  
- **Docker** (recommended, if you want a one-command solution) OR
- **Local runtime** for:
  - Python 3.9+ (Flask, LangChain)
  - Node.js 18+ (Express, Langchain.js)
  - (Optional) React dev server

---

## Quick Start (Docker Compose)

1. **Set `OPENAI_API_KEY`**  
   - Either create a `.env` file in the root folder with:
     ```bash
     OPENAI_API_KEY=sk-xxxxxx
     ```
     or export it in your shell:
     ```bash
     export OPENAI_API_KEY=sk-xxxxxx
     ```
2. **Build and run**:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. **Check containers**:

After running `docker-compose up -d`, you will have four containers running:

- **python-llm-service** (Flask) on port **5001**
- **node-llm-service** (Express) on port **5002**
- **orchestrator** on port **3000**
- **frontend** on port **8080**

You can verify their status and logs by running:

```bash
docker-compose ps
docker-compose logs -f
```

4.	**Open your browser**: http://localhost:8080
You should see a React Flow UI with two default nodes (Python LLM and Node LLM) and one edge between them.

5.	**Click "Run Flow" to execute the entire pipeline**:
The Orchestrator calls each microservice in turn, passes outputs forward, and returns a final result object.

To stop everything:
```bash
docker-compose down
```


