const express = require("express");
require("dotenv").config();
const axios = require('axios');
const cors = require('cors');
const handlers = require('./handlers');

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
            return res.status(400).json({ error: "Missing required parameter: contractAddress" });
        }

        // Call the handler directly (assuming it's properly registered)
        const handler = handlers['analystAgent'];
        if (!handler) {
            return res.status(500).json({ error: "Analyst agent handler not found" });
        }

        // Create a mock node object – in a real flow, this would come from the /execute-flow endpoint
        const mockNode = {
            data: {
                type: 'analystAgent',
                contractAddress,
                parameters
            }
        };

        const result = await handler(mockNode);
        res.json(result); // Send the entire result object

    } catch (error) {
        console.error('Error in /fetch-analysis:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Main Flow Execution Endpoint ---
app.post('/execute-flow', async (req, res) => {
  try {
    const { nodes, edges } = req.body;

    if (!nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ error: "Invalid 'nodes' data provided." });
    }
    if (!edges) { // Edges can be null or an array
      return res.status(400).json({ error: "Invalid 'edges' data provided." });
    }

    const results = {};
    for (const node of nodes) {
      const handler = handlers[node.data.type];
      if (!handler) {
        throw new Error(`No handler found for node type: ${node.data.type}`);
      }
      results[node.id] = await handler(node);
    }

    res.json({ results });
  } catch (error) {
    console.error('Error in /execute-flow:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});