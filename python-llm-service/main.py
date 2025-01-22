from flask import Flask, request, jsonify
import os
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate

app = Flask(__name__)

# 简单示例：使用LangChain Python
# 需要先在环境变量里配置 OPENAI_API_KEY

@app.route('/run', methods=['POST'])
def run_agent():
    data = request.json
    user_input = data.get("input", "")

    # 构建一个简单的PromptTemplate
    prompt_template = PromptTemplate(
        input_variables=["user_input"],
        template="""
        You are a helpful Python-based AI. 
        The user says: {user_input}
        Please provide a concise, friendly answer.
        """
    )
    prompt = prompt_template.format(user_input=user_input)

    # 调用OpenAI（LangChain封装）
    llm = OpenAI(temperature=0.7)  # 依赖 OPENAI_API_KEY
    result = llm(prompt)

    return jsonify({"result": f"[Python LLM] {result.strip()}"})

if __name__ == '__main__':
    # 默认端口5001
    app.run(host='0.0.0.0', port=5001)