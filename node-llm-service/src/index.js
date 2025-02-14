// This file is no longer needed if you're using app.js
// You can delete this file *after* moving the necessary parts to app.js
//  (as shown in the app.js code above).
//  Keep it *only* if you have other top-level initialization code
//  that isn't related to the Express app.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const handlers = require('./handlers'); 

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 