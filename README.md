# Republic - AI Agent Flow Orchestrator

A powerful visual flow-based orchestrator for creating and managing AI agent workflows. This platform allows you to create, connect, and orchestrate different types of AI agents through an intuitive drag-and-drop interface.

## Features

### Core Features
- 🎨 Visual Flow Editor
  - Drag-and-drop interface for creating agent workflows
  - Real-time flow visualization
  - Intuitive node connection system
  - Customizable node configurations

- 🤖 Supported Agent Types
  - **Eliza Agent**: Content creation and strategic planning
  - **ZerePy Agent**: Social media management and blockchain integration
  - **LangChain Agent**: General-purpose language model integration
  - **AutoGPT Agent**: Autonomous task completion
  - **BabyAGI Agent**: Task management and planning

- 🔌 Input/Output Nodes
  - Text input support
  - File upload capabilities
  - API integration
  - Multiple output formats (JSON, XML, YAML)
  - API endpoint output

### Agent Features

#### Eliza Agent
- Content strategy and planning
- Document interaction
- Web search capabilities
- Retrievable memory system
- Tool integration (web search, document handling, code execution)

#### ZerePy Agent
- Social platform integration (Twitter, Farcaster, Discord)
- Blockchain network support
- GOAT plugin system
- Task weight management
- Time-based configuration
- Performance analytics

## Setup

### Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose
- API keys for desired services (OpenAI, Anthropic, etc.)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/republic.git
cd republic
```

2. Create environment files:
```bash
cp .env.example .env
```

3. Update the `.env` file with your API keys and configurations.

4. Build and start the services:
```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000`.

## Usage Examples

### Basic Content Creation Flow

```javascript
// Example flow configuration
{
  "nodes": [
    {
      "id": "1",
      "type": "input",
      "inputText": "Create tech content about AI trends"
    },
    {
      "id": "2",
      "type": "eliza",
      "data": {
        "config": {
          "agentName": "Content Creator",
          "systemPrompt": "Create engaging tech content"
        }
      }
    },
    {
      "id": "3",
      "type": "zerepy",
      "data": {
        "config": {
          "socialPlatforms": ["twitter", "farcaster"]
        }
      }
    },
    {
      "id": "4",
      "type": "output"
    }
  ],
  "edges": [
    {"source": "1", "target": "2"},
    {"source": "2", "target": "3"},
    {"source": "3", "target": "4"}
  ]
}
```

### Advanced Multi-Agent Workflow

See the [examples](./examples) directory for more complex workflow configurations.

## Architecture

The system consists of several key components:

- **Frontend**: React-based visual flow editor
- **Orchestrator**: Node.js service managing workflow execution
- **Agent Services**: Specialized services for each agent type
- **Memory System**: Persistent storage for agent states and data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

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


