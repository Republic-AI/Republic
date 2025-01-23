import React from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles.css';

import CustomNode from './CustomNode';
import { initialNodes, initialEdges } from './initialData';
import axios from 'axios';

// Define node types
const nodeTypes = {
  custom: CustomNode
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = (params) => {
    setEdges((eds) => addEdge(params, eds));
  };

  const handleNodeDataChange = (nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: newData }
          : node
      )
    );
  };

  const handleAddNode = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'custom',
      position: { 
        x: 100 + Math.random() * 100, 
        y: 100 + Math.random() * 100 
      },
      data: {
        type: '',
        inputText: '',
        config: {}
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleRunFlow = async () => {
    try {
      const requestBody = {
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.data.type,
          framework: n.data.framework,
          config: n.data.config,
          inputText: n.data.inputText
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
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-content">
          <h3>AI Agent Flow</h3>
          <button 
            onClick={handleAddNode}
            className="add-node-button"
          >
            <span className="button-icon">+</span>
            Add AI Agent
          </button>
          <button 
            onClick={handleRunFlow}
            className="run-flow-button"
          >
            Run Flow
          </button>
        </div>
      </div>

      {/* Flow Area */}
      <div className="flow-container">
        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            type: 'custom',
            data: {
              ...node.data,
              onChange: (newData) => handleNodeDataChange(node.id, newData)
            }
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}