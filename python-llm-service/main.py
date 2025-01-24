from flask import Flask, request, jsonify
import os
from src.agents.zerepy_agent import ZerePyAgent
from src.agents.langchain_agent import LangChainAgent
from src.agents.babyagi_agent import BabyAGIAgent
from src.agents.autogpt_agent import AutoGPTAgent
import asyncio
from functools import wraps
from dotenv import load_dotenv
from src.app import app

load_dotenv()

# 简单示例：使用LangChain Python
# 需要先在环境变量里配置 OPENAI_API_KEY

def async_route(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))
    return wrapped

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

@app.route('/run', methods=['POST'])
@async_route
async def run_agent():
    data = request.json
    agent_type = data.get("agent_type", "langchain")
    user_input = data.get("input", "")
    config = data.get("config", {})

    try:
        if agent_type == "zerepy":
            agent = ZerePyAgent(config)
            result = await agent.execute(user_input)
            return jsonify(result)
        
        elif agent_type == "langchain":
            agent = LangChainAgent(config)
            result = await agent.execute(user_input)
            return jsonify(result)
            
        elif agent_type == "babyagi":
            agent = BabyAGIAgent(config)
            try:
                result = await agent.execute(user_input)
                return jsonify(result)
            finally:
                await agent.cleanup()
                
        elif agent_type == "autogpt":
            agent = AutoGPTAgent(config)
            try:
                result = await agent.execute(user_input)
                return jsonify(result)
            finally:
                await agent.cleanup()
        
        else:
            return jsonify({"error": f"Unsupported agent type: {agent_type}"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/clear-memory', methods=['POST'])
@async_route
async def clear_memory():
    data = request.json
    agent_type = data.get("agent_type", "langchain")
    config = data.get("config", {})

    try:
        if agent_type == "zerepy":
            agent = ZerePyAgent(config)
            await agent.memory.clear()
        elif agent_type == "langchain":
            agent = LangChainAgent(config)
            await agent.clear_memory()
        elif agent_type == "babyagi":
            agent = BabyAGIAgent(config)
            await agent.cleanup()
        elif agent_type == "autogpt":
            agent = AutoGPTAgent(config)
            await agent.cleanup()
        
        return jsonify({"status": "Memory cleared successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port)