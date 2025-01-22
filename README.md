# AI Microservices Demo

This repository demonstrates a **microservices + HTTP** architecture where multiple AI services (written in different languages) are orchestrated by a central service, and a React Flow front-end provides a **visual flow editor** for chaining AI calls. Each microservice is capable of calling OpenAI (or potentially other AI APIs), and the orchestrator coordinates the sequence in which those services are invoked, based on a graph defined in the front-end.

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
  - **Orchestrator** performs topological sorting of nodes and sequentially invokes each service’s `/run` endpoint.
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

5.	**Click “Run Flow” to execute the entire pipeline**:
The Orchestrator calls each microservice in turn, passes outputs forward, and returns a final result object.

To stop everything:
```bash
docker-compose down
```


