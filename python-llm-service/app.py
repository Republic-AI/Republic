from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

@app.route('/run', methods=['POST'])
def run_agent():
    data = request.json
    agent_type = data.get("agent_type", "langchain")
    user_input = data.get("input", "")
    config = data.get("config", {})

    try:
        if agent_type == "langchain":
            return jsonify({"message": "LangChain agent not implemented yet"})
            
        elif agent_type == "babyagi":
            return jsonify({"message": "BabyAGI agent not implemented yet"})
                
        elif agent_type == "autogpt":
            return jsonify({"message": "AutoGPT agent not implemented yet"})
        
        else:
            return jsonify({"error": f"Unsupported agent type: {agent_type}. Use the Node.js service for ZerePy agent."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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