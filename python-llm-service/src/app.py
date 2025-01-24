from flask import Flask, request, jsonify
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.debug = True

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "python-llm-service"
    })

@app.route('/run', methods=['POST'])
def run_agent():
    try:
        data = request.json
        logger.debug(f"Received request data: {data}")
        
        agent_type = data.get("agent_type", "langchain")
        user_input = data.get("input", "")
        config = data.get("config", {})

        if agent_type == "langchain":
            return jsonify({
                "status": "not_implemented",
                "message": "LangChain agent not implemented yet",
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
        logger.debug(f"Received request data: {data}")
        
        agent_type = data.get("agent_type", "langchain")
        config = data.get("config", {})

        return jsonify({
            "status": "success",
            "message": "Memory cleared successfully",
            "agent_type": agent_type
        })
    except Exception as e:
        logger.exception("Error in clear_memory:")
        return jsonify({
            "status": "error",
            "error": str(e),
            "agent_type": agent_type if 'agent_type' in locals() else 'unknown'
        }), 500 