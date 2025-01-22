const express = require("express");
const bodyParser = require("body-parser");
const { OpenAI } = require("langchain/llms/openai");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// 在 .env 或环境变量中设置 OPENAI_API_KEY
// 这里用 langchain.js 的 OpenAI LLM
app.post("/run", async (req, res) => {
  try {
    const { input } = req.body;

    // 创建 OpenAI LLM
    const model = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7
    });

    // 构造提示
    const prompt = `
      You are a helpful Node.js-based AI.
      The user says: ${input}
      Please respond in a brief and friendly manner.
    `;

    const response = await model.call(prompt);

    res.json({
      result: `[Node LLM] ${response.trim()}`
    });
  } catch (err) {
    console.error("Error in node-llm-service:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Node LLM service listening on port ${PORT}`);
});