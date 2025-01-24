const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require("dotenv").config();

// Import agent handlers
const { executeElizaAgent } = require('./agents/ElizaAgent');
const { executeZerePyAgent } = require('./agents/ZerePyAgent');
const { executeLangChainAgent } = require('./agents/LangChainAgent');
const { executeAutoGPTAgent } = require('./agents/AutoGPTAgent');
const { executeBabyAGIAgent } = require('./agents/BabyAGIAgent');
const { executeInputNode, executeOutputNode, extractAgentResult } = require('./utils/resultHandler');

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());

// Agent handlers mapping
const agentHandlers = {
  'input': executeInputNode,
  'output': executeOutputNode,
  'eliza': executeElizaAgent,
  'zerepy': executeZerePyAgent,
  'langchain': executeLangChainAgent,
  'autogpt': executeAutoGPTAgent,
  'babyagi': executeBabyAGIAgent
};

app.post('/execute-flow', async (req, res) => {
  try {
    const { nodes, edges } = req.body;
    console.log('Received request with nodes:', JSON.stringify(nodes, null, 2));
    
    // Initialize tracking
    const nodeResults = {};
    const inDegree = {};
    const processingOrder = [];
    
    // Calculate in-degrees
    nodes.forEach(n => {
      inDegree[n.id] = 0;
    });
    edges.forEach(e => {
      inDegree[e.target]++;
    });
    
    // Start with nodes that have no incoming edges
    const queue = nodes.filter(n => inDegree[n.id] === 0);
    console.log('Starting nodes:', queue.map(n => n.id));

    // Process nodes in topological order
    while (queue.length > 0) {
      const current = queue.shift();
      const nodeId = current.id;
      const nodeType = current.type || (current.data && current.data.type);
      console.log(`Processing node ${nodeId}`);

      try {
        // Get input for current node
        let inputString = current.inputText || "";
        const incomingEdges = edges.filter(e => e.target === nodeId);
        
        // Collect inputs from previous nodes
        if (incomingEdges.length > 0) {
          const inputs = [];
          for (const edge of incomingEdges) {
            const sourceResult = nodeResults[edge.source];
            if (sourceResult) {
              // Extract content from result object
              const content = sourceResult.content || extractAgentResult(sourceResult);
              inputs.push(content);
            }
          }
          inputString = inputs.join('\n\n');
        }

        console.log(`Node ${nodeId} input:`, inputString);

        const nodeConfig = current.config || (current.data && current.data.config) || {};
        
        let result;
        if (nodeType === 'output') {
          // For output nodes, collect all previous results
          const allResults = processingOrder.map(prevNodeId => {
            const prevNode = nodes.find(n => n.id === prevNodeId);
            const prevResult = nodeResults[prevNodeId];
            const prevType = prevNode.type || (prevNode.data && prevNode.data.type);
            
            // Extract the actual content from the result
            const content = prevResult.content || extractAgentResult(prevResult);
            
            return `Results from ${prevType} (${prevNodeId}):\n${content}`;
          });
          
          // Execute output node with formatted results
          const outputResult = await executeOutputNode(allResults, nodeConfig);
          
          result = {
            content: outputResult,
            metadata: {
              nodeId,
              type: nodeType,
              timestamp: new Date().toISOString()
            }
          };
        } else if (agentHandlers[nodeType]) {
          // Execute node handler (input, agent, etc.)
          const handlerResult = await agentHandlers[nodeType](inputString, nodeConfig);
          
          // Store result in a consistent format
          result = {
            content: typeof handlerResult === 'object' ? 
              extractAgentResult(handlerResult) : 
              handlerResult,
            metadata: {
              nodeId,
              type: nodeType,
              timestamp: new Date().toISOString()
            }
          };
        } else {
          result = {
            content: `Unsupported node type: ${nodeType}`,
            metadata: {
              nodeId,
              type: nodeType,
              timestamp: new Date().toISOString()
            }
          };
        }

        nodeResults[nodeId] = result;
        processingOrder.push(nodeId);
        console.log(`Node ${nodeId} result:`, result);

        // Queue next nodes
        edges
          .filter(e => e.source === nodeId)
          .forEach(e => {
            inDegree[e.target]--;
            if (inDegree[e.target] === 0) {
              const nextNode = nodes.find(n => n.id === e.target);
              if (nextNode) queue.push(nextNode);
            }
          });

      } catch (error) {
        console.error(`Error executing node ${nodeId}:`, error);
        nodeResults[nodeId] = {
          content: `Error in node ${nodeId}: ${error.message}`,
          metadata: {
            nodeId,
            type: nodeType,
            error: error.message,
            timestamp: new Date().toISOString()
          }
        };
      }
    }

    console.log('Final results:', nodeResults);
    return res.json({ nodeResults });
    
  } catch (err) {
    console.error('Error in execute-flow:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Orchestrator running on port 3000');
}); 