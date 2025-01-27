const express = require("express");
const bodyParser = require("body-parser");
const { OpenAI } = require("langchain/llms/openai");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.post("/run", async (req, res) => {
  try {
    const { input, config } = req.body;

    // Get API key from config or environment
    const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found in config or environment variables');
    }

    // Create OpenAI LLM with consistent config structure
    const model = new OpenAI({
      openAIApiKey: apiKey,
      temperature: config?.modelConfig?.modelParams?.temperature || 0.7,
      modelName: config?.modelConfig?.foundationModel || 'gpt-3.5-turbo',
      maxTokens: config?.modelConfig?.modelParams?.maxTokens || 1000,
      topP: config?.modelConfig?.modelParams?.topP || 1
    });

    // Construct prompt
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