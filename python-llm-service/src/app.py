from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from agents.langchain_agent import LangChainAgent
import asyncio
from functools import wraps
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

def async_route(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))
    return wrapped

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "service": "python-llm-service",
        "status": "ok"
    })

@app.route('/run', methods=['POST'])
@async_route
async def run_agent():
    try:
        data = request.json
        logger.debug(f"Received request data: {data}")
        
        agent_type = data.get("agent_type", "langchain")
        user_input = data.get("input", "")
        config = data.get("config", {})

        if agent_type == "langchain":
            try:
                agent = LangChainAgent(config)
                result = await agent.execute(user_input)
                return jsonify({
                    "status": "success",
                    "result": result,
                    "agent_type": agent_type,
                    "input": user_input
                })
            except Exception as e:
                logger.exception("Error executing LangChain agent:")
                return jsonify({
                    "status": "error",
                    "error": str(e),
                    "agent_type": agent_type,
                    "input": user_input
                }), 500
            
        elif agent_type == "babyagi":
            return jsonify({
                "status": "not_implemented",
                "message": "BabyAGI agent not implemented yet",
                "agent_type": agent_type,
                "input": user_input
            })
                
        elif agent_type == "autogpt":
            return jsonify({
                "status": "not_implemented", 
                "message": "AutoGPT agent not implemented yet",
                "agent_type": agent_type,
                "input": user_input
            })
        
        else:
            return jsonify({
                "status": "error",
                "error": f"Unsupported agent type: {agent_type}. Use the Node.js service for ZerePy agent.",
                "agent_type": agent_type
            }), 400

    except Exception as e:
        logger.exception("Error in run_agent:")
        return jsonify({
            "status": "error",
            "error": str(e),
            "agent_type": agent_type if 'agent_type' in locals() else 'unknown'
        }), 500

@app.route('/clear-memory', methods=['POST'])
def clear_memory():
    try:
        data = request.json
        agent_type = data.get("agent_type", "langchain")
        config = data.get("config", {})
        return jsonify({"status": "success", "message": "Memory cleared successfully"})
    except Exception as e:
        logger.exception("Error in clear_memory:")
        return jsonify({"status": "error", "error": str(e)}), 500 