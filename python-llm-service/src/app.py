from flask import Flask, request, jsonify
import os
from agents.zerepy_agent import ZerePyAgent
from agents.langchain_agent import LangChainAgent
from agents.babyagi_agent import BabyAGIAgent
from agents.autogpt_agent import AutoGPTAgent
from core.async_utils import async_route
from utils.error_handler import handle_error
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

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
        return handle_error(e)

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
        return handle_error(e) 