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
import TwitterFetcherNode from './TwitterFetcherNode';
import SmartWalletFollowerNode from './SmartWalletFollowerNode';
import TradingAgentNode from './TradingAgentNode';
import AnalystAgentNode from './AnalystAgentNode';

// Define node types
const nodeTypes = {
  custom: CustomNode,
  twitterFetcher: TwitterFetcherNode,
  smartWalletFollower: SmartWalletFollowerNode,
  tradingAgent: TradingAgentNode,
  analystAgent: AnalystAgentNode
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

  const handleAddTwitterFetcher = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'twitterFetcher',
      position: {
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 100
      },
      data: {
        type: 'twitterFetcher',
        framework: 'twitterFetcher',
        targetAccounts: [],
        fetchInterval: 60000, // 1 minute in milliseconds
        lastFetchTime: null,
        tweets: [],
        onChange: (newData) => handleNodeDataChange(newNode.id, newData)
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddSmartWalletFollower = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'smartWalletFollower',
      position: {
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 100
      },
      data: {
        type: 'smartWalletFollower',
        framework: 'smartWalletFollower',
        targetWallets: [],
        fetchInterval: 60000, // 1 minute in milliseconds
        lastFetchTime: null,
        transactions: [],
        onChange: (newData) => handleNodeDataChange(newNode.id, newData)
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddTradingAgent = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'tradingAgent',
      position: {
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 100
      },
      data: {
        type: 'tradingAgent',
        framework: 'tradingAgent',
        tradingPairs: [],
        fetchInterval: 60000, // 1 minute in milliseconds
        lastFetchTime: null,
        tradingData: [],
        onChange: (newData) => handleNodeDataChange(newNode.id, newData)
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddAnalystAgent = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'analystAgent',
      position: {
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 100
      },
      data: {
        type: 'analystAgent',
        framework: 'analystAgent',
        analysisParameters: [],
        fetchInterval: 60000, // 1 minute in milliseconds
        lastFetchTime: null,
        analysisData: [],
        onChange: (newData) => handleNodeDataChange(newNode.id, newData)
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

      console.log('Sending request:', JSON.stringify(requestBody, null, 2));
      const resp = await axios.post("http://localhost:3000/execute-flow", requestBody);
      console.log('Received response:', resp.data);

      // Update nodes with their results
      setNodes((nds) =>
        nds.map((node) => {
          if (node.data.type === 'output') {
            // For output nodes, collect results from all connected nodes
            const inputNodeIds = edges
              .filter(e => e.target === node.id)
              .map(e => e.source);

            console.log('Output node connected to:', inputNodeIds);

            let results = '';
            inputNodeIds.forEach(sourceId => {
              const sourceNode = nodes.find(n => n.id === sourceId);
              const result = resp.data.results[sourceId];
              if (result) {
                const content = result.content || result;
                results += `Results from ${sourceNode.data.type} (${sourceId}):\n${content}\n\n`;
              }
            });

            return {
              ...node,
              data: {
                ...node.data,
                inputText: results || 'No results available'
              }
            };
          }

          // For non-output nodes, store their results
          const result = resp.data.results[node.id];
          return {
            ...node,
            data: {
              ...node.data,
              outputResult: result ? (result.content || result) : undefined
            }
          };
        })
      );
    } catch (error) {
      console.error('Error executing flow:', error);
      alert(`Error executing flow: ${error.message}`);
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
            <h4>Create Your AI Agent</h4>
            <button 
              onClick={() => handleAddNode()}
              className="add-node-button agent-button"
            >
              <span className="button-icon">+</span>
              Add AI Agent
            </button>
          </div>

          {/* Import AI Agents */}
          <div className="node-buttons-group">
            <h4>Import AI Agents</h4>
            <ul className="import-agents-list">
              <li>
                <button 
                  className="import-agent-button twitter-fetcher-button"
                  onClick={handleAddTwitterFetcher}
                >
                  <span className="button-icon">🐦</span>
                  Twitter Fetcher
                </button>
                <p className="agent-description">
                  Fetches tweets from multiple target Twitter accounts in one minute.
                </p>
              </li>
              <li>
                <button 
                  className="import-agent-button smart-wallet-follower-button"
                  onClick={handleAddSmartWalletFollower}
                >
                  <span className="button-icon">💰</span>
                  Smart Wallet Follower
                </button>
                <p className="agent-description">
                  Follows the transactions of multiple target smart wallets.
                </p>
              </li>
              <li>
                <button 
                  className="import-agent-button analyst-agent-button"
                  onClick={handleAddAnalystAgent}
                >
                  <span className="button-icon">🔍</span>
                  Analyst Agent
                </button>
                <p className="agent-description">
                  Analyzes specified parameters to generate insights.
                </p>
              </li>
              <li>
                <button 
                  className="import-agent-button trading-agent-button"
                  onClick={handleAddTradingAgent}
                >
                  <span className="button-icon">📈</span>
                  Trading Agent
                </button>
                <p className="agent-description">
                  Fetches trading data for designated trading pairs.
                </p>
              </li>
            </ul>
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