const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

/**
 * 前端会发送一个 "graph" 对象，包含节点列表和连线。
 * 每个节点有: { id, type, inputText, ... }，也有 edges 列表指示节点间的连接。
 *
 * Example graph (simplified):
 * {
 *   "nodes": [
 *     { "id": "1", "type": "python-llm", "inputText": "Hello, Python LLM" },
 *     { "id": "2", "type": "node-llm", "inputText": "We got: {PREV_RESULT}" }
 *   ],
 *   "edges": [
 *     { "source": "1", "target": "2" }
 *   ]
 * }
 *
 * We'll do a simple topological run:
 * 1. Find nodes with no incoming edge => start nodes
 * 2. Execute them => store output
 * 3. Pass output to connected nodes => replace {PREV_RESULT} placeholders
 * 4. Execute next => ...
 * (For simplicity, we'll assume there's no complex branching in this minimal demo.)
 */

app.post('/execute-flow', async (req, res) => {
  try {
    const { nodes, edges } = req.body;

    // Track node outputs in a map
    const nodeResults = {};

    // Determine in-degree for each node
    const inDegree = {};
    nodes.forEach(n => (inDegree[n.id] = 0));
    edges.forEach(e => { inDegree[e.target]++; });

    // We'll repeatedly find nodes with inDegree=0 => execute => then reduce inDegree of connected targets
    const queue = nodes.filter(n => inDegree[n.id] === 0);

    while (queue.length > 0) {
      const current = queue.shift();
      const nodeId = current.id;

      // Prepare input string (replace {PREV_RESULT} if needed)
      let inputString = current.inputText || "";
      // If there's only one predecessor, we use that result
      // (a more robust approach might handle multiple predecessors, etc.)
      if (edges.some(e => e.target === nodeId)) {
        // find a single source edge
        const incomingEdge = edges.find(e => e.target === nodeId);
        if (incomingEdge) {
          const sourceId = incomingEdge.source;
          const prevOutput = nodeResults[sourceId] || "";
          inputString = inputString.replace("{PREV_RESULT}", prevOutput);
        }
      }

      // Decide which microservice URL to call based on node type
      let serviceUrl = "";
      if (current.type === "python-llm") {
        serviceUrl = "http://python-llm-service:5001/run"; 
        // 在Docker Compose下用服务名作为host；若本地非Docker环境可换localhost:5001
      } else if (current.type === "node-llm") {
        serviceUrl = "http://node-llm-service:5002/run";
      } else {
        // 也可以有更多类型
      }

      let result = `No service matched for type: ${current.type}`;
      if (serviceUrl) {
        const resp = await axios.post(serviceUrl, { input: inputString });
        result = resp.data.result;
      }
      nodeResults[nodeId] = result;

      // reduce in-degree of successors
      edges
        .filter(e => e.source === nodeId)
        .forEach(e => {
          inDegree[e.target]--;
          if (inDegree[e.target] === 0) {
            // push the target node into queue
            const targetNode = nodes.find(n => n.id === e.target);
            queue.push(targetNode);
          }
        });
    }

    // Return the outputs of all nodes
    return res.json({ nodeResults });
  } catch (err) {
    console.error("Error in orchestrator /execute-flow:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Orchestrator running on port 3000');
});