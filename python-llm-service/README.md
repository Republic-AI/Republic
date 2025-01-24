# Python LLM Service

A Python-based LLM service that supports multiple agent frameworks including LangChain and ZerePy.

## Features

### LangChain Integration
- Advanced agent system with tools:
  - Web search (DuckDuckGo)
  - Wikipedia queries
  - Memory system for context retention
  - Custom tool integration support
  - Async operation support

### ZerePy Integration
- Social media management
- Support for Twitter and Discord platforms
- Advanced memory system
- Task prioritization

## Setup

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Run the service:
```bash
python main.py
```

The service will run on http://localhost:5001

## API Endpoints

### Health Check
```
GET /health
```

### Run Agent
```
POST /run
```

Request body for LangChain:
```json
{
  "agent_type": "langchain",
  "input": "Your input text",
  "config": {
    "temperature": 0.7,
    "use_search": true,
    "use_wikipedia": true,
    "verbose": true
  }
}
```

Request body for ZerePy:
```json
{
  "agent_type": "zerepy",
  "input": "Your input text",
  "config": {
    "agent_name": "CustomAgent",
    "agent_bio": "Custom bio",
    "traits": ["trait1", "trait2"],
    "task_weights": {
      "content_creation": 0.4,
      "engagement": 0.3,
      "analysis": 0.3
    },
    "social_platforms": ["twitter", "discord"],
    "discord_channels": ["channel_id1", "channel_id2"]
  }
}
```

### Clear Memory
```
POST /clear-memory
```
Request body:
```json
{
  "agent_type": "langchain|zerepy"
}
```

## Environment Variables

Required:
- `OPENAI_API_KEY`: Your OpenAI API key

Optional (for social media integration):
- `TWITTER_API_KEY`: Twitter API key
- `TWITTER_API_SECRET`: Twitter API secret
- `TWITTER_ACCESS_TOKEN`: Twitter access token
- `TWITTER_ACCESS_TOKEN_SECRET`: Twitter access token secret
- `DISCORD_TOKEN`: Discord bot token

## Agent Configuration

### LangChain Agent
- `temperature`: Model temperature (0-1)
- `use_search`: Enable web search tool
- `use_wikipedia`: Enable Wikipedia tool
- `verbose`: Enable detailed logging

### ZerePy Agent
- Agent name and bio
- Personality traits
- Task weights for different operations
- Social platform integrations
- Memory system type

See the example request bodies above for configuration options.