const express = require("express");
require("dotenv").config();
const axios = require('axios');
const cors = require('cors');
const handlers = require('./handlers');
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = process.env.PORT || 5002;

// Enable CORS for all origins (for development)
app.use(cors());
app.use(express.json());

// Endpoint to handle fetching analysis data
app.post('/fetch-analysis', async (req, res) => {
    try {
        const { contractAddress, parameters } = req.body;

        if (!contractAddress) {
            return res.json({
                error: "Missing required parameter: contractAddress",
                analysisData: {
                    meetsCriteria: false,
                    name: "Unknown",
                    symbol: "Unknown",
                    contractAddress: "",
                    risk: {
                        score: 0,
                        rugged: false,
                        details: []
                    }
                }
            });
        }

        // Call the handler directly
        const handler = handlers['analystAgent'];
        if (!handler) {
            return res.json({
                error: "Analyst agent handler not found",
                analysisData: {
                    meetsCriteria: false,
                    name: "Unknown",
                    symbol: "Unknown",
                    contractAddress: contractAddress,
                    risk: {
                        score: 0,
                        rugged: false,
                        details: []
                    }
                }
            });
        }

        // Create a mock node object
        const mockNode = {
            data: {
                type: 'analystAgent',
                contractAddress,
                parameters
            }
        };

        const result = await handler(mockNode);
        
        // Ensure result always has analysisData with meetsCriteria property
        if (!result.analysisData) {
            result.analysisData = {
                meetsCriteria: false,
                name: "Unknown",
                symbol: "Unknown",
                contractAddress: contractAddress,
                risk: {
                    score: 0,
                    rugged: false,
                    details: []
                }
            };
        }
        
        res.json(result);

    } catch (error) {
        console.error('Error in /fetch-analysis:', error);
        res.json({
            error: error.message || "An unknown error occurred",
            analysisData: {
                meetsCriteria: false,
                name: "Error",
                symbol: "ERR",
                contractAddress: req.body?.contractAddress || "",
                risk: {
                    score: 0,
                    rugged: false,
                    details: []
                }
            }
        });
    }
});

// --- Main Flow Execution Endpoint ---
app.post('/execute-flow', async (req, res) => {
  try {
    const { nodes } = req.body;
    console.log("/execute-flow route hit. Request body:", req.body);

    if (!nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ error: "Invalid 'nodes' data provided." });
    }

    const results = {};
    for (const node of nodes) {
      const nodeType = node.type || node.data?.type;
      const handler = handlers[nodeType];
      if (handler) {
        console.log("Calling handler:", handler.name, "for node type:", nodeType);
        results[node.id] = await handler(node);
      } else {
        console.warn(`No handler found for node type: ${nodeType}`);
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Error in /execute-flow:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- New Endpoint for Trading AI Prompt Analysis ---
app.post('/analyze-trading-prompt', async (req, res) => {
    try {
        const { prompt, currentParameters, openAIApiKey } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Missing required parameter: prompt" });
        }
        if (!openAIApiKey) {
            return res.status(400).json({ error: "Missing required parameter: openAIApiKey" });
        }

        // Use OpenAI to analyze the prompt
        const extractedParameters = await analyzeTradingPromptWithAI(prompt, currentParameters, openAIApiKey);

        res.json({
            parameters: extractedParameters
        });

    } catch (error) {
        console.error('Error in /analyze-trading-prompt:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update the analyze-prompt endpoint
app.post('/analyze-prompt', async (req, res) => {
    try {
        const { aiPrompt, contractAddress, openAIApiKey } = req.body;

        if (!aiPrompt) {
            return res.status(400).json({ error: "Missing required parameter: aiPrompt" });
        }
        if (!contractAddress) {
            return res.status(400).json({ error: "Missing required parameter: contractAddress" });
        }
        if (!openAIApiKey) {
            return res.status(400).json({ error: "Missing required parameter: openAIApiKey" });
        }

        const extractedParameters = await analyzePromptWithAI(aiPrompt, contractAddress, openAIApiKey);

        // Create a mock node object for the analystAgentHandler
        const mockNode = {
            data: {
                type: 'analystAgent',
                contractAddress,
                parameters: extractedParameters, // Pass extracted parameters
                openAIApiKey // Pass the API key
            }
        };

        // Call the analystAgentHandler with the mock node
        const analysisResult = await analystAgentHandler(mockNode);

    res.json({
            parameters: extractedParameters, // Return extracted parameters
            ...analysisResult, // Include analysis results
        });

    } catch (error) {
        console.error('Error in /analyze-prompt:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add this function to app.js or create a separate handler file
async function analyzePromptWithAI(prompt, contractAddress, apiKey) {
    try {
        const configuration = new Configuration({
            apiKey: apiKey, // Use the provided API key
        });
        const openai = new OpenAIApi(configuration);

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an AI that analyzes user prompts to extract trading parameters.
                    The user will provide a prompt describing their trading strategy.
                    Your task is to extract the following parameters and return them in JSON format:
                    
                    - fixedBuy (number): Amount to buy in SOL.
                    - maxBuy (number): Maximum amount to buy in SOL.
                    - sellAt (number): Take profit percentage.
                    - stopLoss (number): Stop loss percentage.
                    - gas (number): Gas fee in SOL.
                    - slippage (number): Slippage percentage.
                    - antiMEV (boolean): Whether to use anti-MEV protection.

                    If a parameter is not specified in the prompt, do NOT include it in the JSON output.
                    Only include parameters that can be confidently extracted from the prompt.
                    
                    Example prompt: "Buy 0.5 SOL with 1% slippage, sell at 150% profit, and set stop loss at 30%"
                    
                    Expected JSON output:
                    {
                      "fixedBuy": 0.5,
                      "sellAt": 150,
                      "stopLoss": 30,
                      "slippage": 1
                    }
                    
                    Do NOT include any additional text or explanation. Output ONLY the JSON.
                    `
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.2,
            max_tokens: 200,
        });

        const extractedParameters = JSON.parse(response.data.choices[0].message.content);
        return extractedParameters;

    } catch (error) {
        console.error('Error in AI prompt analysis:', error);
        return {}; // Return empty object on error
    }
}

// Update the analyzeTradingPromptWithAI function
async function analyzeTradingPromptWithAI(prompt, currentParameters, apiKey) {
    try {
        const configuration = new Configuration({
            apiKey: apiKey, // Use the provided API key
        });
        const openai = new OpenAIApi(configuration);

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an AI that analyzes user prompts to extract trading parameters.
                    The user will provide a prompt describing their trading strategy.
                    Your task is to extract the following parameters and return them in JSON format:
                    
                    - fixedBuy (number): Amount to buy in SOL.
                    - maxBuy (number): Maximum amount to buy in SOL.
                    - sellAt (number): Take profit percentage.
                    - stopLoss (number): Stop loss percentage.
                    - gas (number): Gas fee in SOL.
                    - slippage (number): Slippage percentage.
                    - antiMEV (boolean): Whether to use anti-MEV protection.

                    If a parameter is not specified in the prompt, do NOT include it in the JSON output.
                    Only include parameters that can be confidently extracted from the prompt.
                    
                    Example prompt: "Buy 0.5 SOL with 1% slippage, sell at 150% profit, and set stop loss at 30%"
                    
                    Expected JSON output:
                    {
                      "fixedBuy": 0.5,
                      "sellAt": 150,
                      "stopLoss": 30,
                      "slippage": 1
                    }
                    
                    Do NOT include any additional text or explanation. Output ONLY the JSON.
                    `
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.2,
            max_tokens: 200,
        });

        const extractedParameters = JSON.parse(response.data.choices[0].message.content);
        return extractedParameters;

    } catch (error) {
        console.error('Error in AI trading prompt analysis:', error);
        return {}; // Return empty object on error
    }
}

// Add the generate-multi-agent endpoint to your app.js
app.post('/generate-multi-agent', async (req, res) => {
  try {
    const { prompt, apiKey, model } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Missing required parameter: prompt" });
    }
    
    if (!apiKey) {
      return res.status(400).json({ error: "Missing required parameter: apiKey" });
    }
    
    // Create a node object for the handler
    const node = {
      data: {
        type: 'promptToAgent',
        prompt,
        apiKey,
        model: model || 'gpt-4'
      }
    };
    
    // Call the handler
    const handler = handlers['promptToAgent'];
    if (!handler) {
      return res.status(500).json({ error: "Prompt to Agent handler not found" });
    }
    
    const result = await handler(node);
    res.json(result);
    
  } catch (error) {
    console.error('Error in /generate-multi-agent:', error);
    res.status(500).json({ error: error.message || "An unknown error occurred" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});