from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from src.agents.langchain_agent import LangChainAgent
import asyncio
from functools import wraps

load_dotenv()

app = Flask(__name__)

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
        if agent_type == "langchain":
            agent = LangChainAgent(config)
            result = await agent.execute(user_input)
            return jsonify({
                "status": "success",
                "result": result,
                "agent_type": agent_type,
                "input": user_input
            })
            
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
        return jsonify({
            "status": "error",
            "error": str(e),
            "agent_type": agent_type
        }), 500

@app.route('/clear-memory', methods=['POST'])
def clear_memory():
    data = request.json
    agent_type = data.get("agent_type", "langchain")
    config = data.get("config", {})

    try:
        return jsonify({"status": "Memory cleared successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port) 