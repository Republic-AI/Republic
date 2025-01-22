import React, { useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState
} from 'reactflow';
import 'reactflow/dist/style.css';

import NodeConfigPanel from './NodeConfigPanel.jsx';
import { initialNodes, initialEdges } from './initialData';
import axios from 'axios';

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 当连线被创建时触发
  const onConnect = (params) => {
    setEdges((eds) => addEdge(params, eds));
  };

  // 点击 "Run Flow"
  const handleRunFlow = async () => {
    try {
      // 把 React Flow 的节点、edges 转化成 orchestrator 所需的简单结构
      // 这里我们假设 data={ type, inputText } 放在 node.data
      const requestBody = {
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.data.type,          // "python-llm" or "node-llm"
          inputText: n.data.inputText // user input
        })),
        edges: edges.map(e => ({
          source: e.source,
          target: e.target
        }))
      };

      const resp = await axios.post("http://localhost:3000/execute-flow", requestBody);
      alert(JSON.stringify(resp.data, null, 2));
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', zIndex: 10, top: 10, left: 10 }}>
        <NodeConfigPanel nodes={nodes} setNodes={setNodes} />
        <button onClick={handleRunFlow}>Run Flow</button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}