import React from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  Panel
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

  const handleAddNode = (type) => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'custom',
      position: { 
        x: 100 + Math.random() * 100, 
        y: 100 + Math.random() * 100 
      },
      data: {
        type: type || '',
        framework: type || '',
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

  // Handle wheel event to prevent zooming when over nodes
  const onNodeWheel = (event, node) => {
    const target = event.target;
    const isScrollable = target.classList.contains('node-config') || 
                        target.classList.contains('node-textarea') ||
                        target.classList.contains('node-multiselect');
    
    if (isScrollable) {
      event.stopPropagation();
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-content">
          <h3>AI Agent Flow</h3>
          
          {/* Data Flow Nodes */}
          <div className="node-buttons-group">
            <h4>Data Flow</h4>
            <button 
              onClick={() => handleAddNode('input')}
              className="add-node-button input-button"
            >
              <span className="button-icon">⇥</span>
              Add Input Node
            </button>
            <button 
              onClick={() => handleAddNode('output')}
              className="add-node-button output-button"
            >
              <span className="button-icon">⇤</span>
              Add Output Node
            </button>
          </div>

          {/* AI Agent Node */}
          <div className="node-buttons-group">
            <h4>AI Agent</h4>
            <button 
              onClick={() => handleAddNode()}
              className="add-node-button agent-button"
            >
              <span className="button-icon">+</span>
              Add AI Agent
            </button>
          </div>

          {/* Run Flow Button */}
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
          onNodeWheel={onNodeWheel}
          nodeTypes={nodeTypes}
          fitView
          preventScrolling={false}
          zoomOnScroll={false}
          zoomOnPinch={true}
          panOnScroll={true}
          panOnScrollMode="free"
          selectionOnDrag={true}
          noWheelClassName="no-wheel"
        >
          <Background />
          <Controls showZoom={true} />
          <MiniMap />
          <Panel position="top-right" className="zoom-controls">
            <button onClick={() => document.querySelector('.react-flow__controls-zoomin').click()}>
              Zoom In
            </button>
            <button onClick={() => document.querySelector('.react-flow__controls-zoomout').click()}>
              Zoom Out
            </button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}