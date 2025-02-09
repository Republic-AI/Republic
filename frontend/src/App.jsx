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
import './styles.css';

import CustomNode from './CustomNode';
import { initialNodes, initialEdges } from './initialData';
import axios from 'axios';
import TwitterFetcherNode from './TwitterFetcherNode';
import SmartMoneyFollowerNode from './SmartMoneyFollowerNode';
import TradingAgentNode from './TradingAgentNode';
import AnalystAgentNode from './AnalystAgentNode';
import TwitterAgentNode from './TwitterAgentNode';

// Define node types
const nodeTypes = {
  custom: CustomNode,
  twitterFetcher: TwitterFetcherNode,
  smartMoneyFollower: SmartMoneyFollowerNode,
  tradingAgent: TradingAgentNode,
  analystAgent: AnalystAgentNode,
  twitterAgent: TwitterAgentNode
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSocialMediaHubOpen, setIsSocialMediaHubOpen] = useState(false);
  const [isDefiHubOpen, setIsDefiHubOpen] = useState(false);

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
        bearerToken: '',
        fetchInterval: 60000,
        lastFetchTime: null,
        tweets: [],
        onChange: (newData) => handleNodeDataChange(newNode.id, newData)
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddSmartMoneyFollower = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'smartMoneyFollower',
      position: {
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 100
      },
      data: {
        type: 'smartMoneyFollower',
        framework: 'smartMoneyFollower',
        targetWallets: [],
        fetchInterval: 60000,
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
        settings: {
          fixedBuy: '',
          maxBuy: '',
          sellStrategy: 'copy',
          gas: '',
          autoSlippage: false,
          antiMEV: false
        },
        fetchInterval: 60000,
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
        parameters: {
          mktCap: 0,
          liquidity: 0,
          holders: 0,
          snipers: 0,
          blueChip: 0,
          top10: 0,
          hasAudit: false
        },
        fetchInterval: 60000,
        lastFetchTime: null,
        analysisData: [],
        onChange: (newData) => handleNodeDataChange(newNode.id, newData)
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddTwitterAgent = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'twitterAgent',
      position: {
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 100
      },
      data: {
        type: 'twitterAgent',
        framework: 'eliza',
        bearerToken: '',
        pullConfig: {
          prompt: '',
          realTime: false,
          timeLength: '24',
          targetAccounts: [],
          newAccount: '',
          fetchInterval: 60000,
          lastFetchTime: null,
          checkCA: false,
          checkCoin: false
        },
        postConfig: {
          elizaPrompt: '',
          customRules: '',
          targetAccounts: [],
          newAccount: ''
        },
        replyConfig: {
          elizaPrompt: '',
          customRules: '',
          targetAccounts: [],
          newAccount: ''
        },
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

          {/* AI Agent Marketplace */}
          <div className="node-buttons-group">
            <h4>AI Agent Marketplace</h4>
            <div className="marketplace-folders">
              {/* Info Hub Folder */}
              <div className="marketplace-folder">
                <div className="folder-header" onClick={() => setIsSocialMediaHubOpen(!isSocialMediaHubOpen)}>
                  <span className="folder-icon">{isSocialMediaHubOpen ? '📂' : '📁'}</span>
                  <span className="folder-name">Social Media Hub</span>
                  <span className="folder-arrow">{isSocialMediaHubOpen ? '▼' : '▶'}</span>
                </div>
                
                {isSocialMediaHubOpen && (
                  <ul className="import-agents-list">
                    <li>
                      <button 
                        className="import-agent-button twitter-agent-button"
                        onClick={handleAddTwitterAgent}
                      >
                        <span className="button-icon">🤖</span>
                        Twitter Agent (Eliza)
                      </button>
                      <p className="agent-description">
                        Eliza-based Twitter agent for pulling, posting, and replying to tweets.
                      </p>
                    </li>
                  </ul>
                )}
              </div>

              {/* DeFi Hub Folder */}
              <div className="marketplace-folder">
                <div className="folder-header" onClick={() => setIsDefiHubOpen(!isDefiHubOpen)}>
                  <span className="folder-icon">{isDefiHubOpen ? '📂' : '📁'}</span>
                  <span className="folder-name">DeFi Hub</span>
                  <span className="folder-arrow">{isDefiHubOpen ? '▼' : '▶'}</span>
                </div>
                
                {isDefiHubOpen && (
                  <ul className="import-agents-list">
                    <li>
                      <button 
                        className="import-agent-button smart-money-follower-button"
                        onClick={handleAddSmartMoneyFollower}
                      >
                        <span className="button-icon">💰</span>
                        Smart Money Follower
                      </button>
                      <p className="agent-description">
                        Follows the transactions of multiple smart money addresses.
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
                )}
              </div>
            </div>
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