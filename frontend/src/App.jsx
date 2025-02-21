import React, { useState, useMemo, useEffect } from 'react';
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
import ErrorBoundary from './ErrorBoundary';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';

import CustomNode from './CustomNode';
import { initialNodes, initialEdges } from './initialData';
import axios from 'axios';
import SmartMoneyAddressNode from './SmartMoneyFollowerNode';
import TradingAgentNode from './TradingAgentNode';
import AnalystAgentNode from './AnalystAgentNode';
import TwitterAgentNode from './TwitterAgentNode';
import DiscordAgentNode from './DiscordAgentNode';
import TelegramAgentNode from './TelegramAgentNode';
import TwitterKOLNode from './TwitterKOLNode';
import WebViewNode from './WebViewNode';

// Define node types
const nodeTypes = {
  custom: CustomNode,
  tradingAgent: TradingAgentNode,
  analystAgent: AnalystAgentNode,
  twitterAgent: TwitterAgentNode,
  discordAgent: DiscordAgentNode,
  telegramAgent: TelegramAgentNode,
  smartMoneyFollower: SmartMoneyAddressNode,
  twitterKOL: TwitterKOLNode,
  webview: WebViewNode,
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSocialMediaHubOpen, setIsSocialMediaHubOpen] = useState(false);
  const [isDefiHubOpen, setIsDefiHubOpen] = useState(false);
  const [isDataHubOpen, setIsDataHubOpen] = useState(false);
  const [network, setNetwork] = useState(WalletAdapterNetwork.Mainnet);
  const endpoint = useMemo(() => {
      if (network === WalletAdapterNetwork.Mainnet) {
          return "https://attentive-lingering-general.solana-mainnet.quiknode.pro/b510e1a738a9447f3a963bc61b7f002287b72eb1/";
      }
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter()
    ],
    [network]
  );

  // Correctly propagate node outputs to connected nodes
  useEffect(() => {
    setNodes((prevNodes) => {
      return prevNodes.map((node) => {
        // Find incoming edges (edges where this node is the target)
        const incomingEdges = edges.filter((edge) => edge.target === node.id);

        // If there are no incoming edges, return the node as is
        if (incomingEdges.length === 0) {
          return node;
        }

        // Create an 'inputs' array to store data from connected nodes
        const inputs = incomingEdges.map((edge) => {
          const sourceNode = prevNodes.find((n) => n.id === edge.source);
          return {
            source: edge.source,
            output: sourceNode?.data?.output, // Get the output from the source node
          };
        });

        // Return the updated node with the 'inputs' array
        return {
          ...node,
          data: {
            ...node.data,
            inputs: inputs, // Update ONLY the 'inputs' property
          },
        };
      });
    });
  }, [edges, nodes, setNodes]); // Depend on edges and nodes

  const onConnect = (params) => {
    console.log('Edge connected:', params);
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
        config: {},
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
        settings: {},
        fetchInterval: 60000,
        lastFetchTime: null,
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
        parameters: {},
        contractAddress: '',
        fetchInterval: 60000,
        lastFetchTime: null,
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
        framework: 'twitterAgent',
        bearerToken: '',
        pullConfig: {},
        postConfig: {},
        replyConfig: {},
        onChange: (newData) => handleNodeDataChange(newNode.id, newData)
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddDiscordAgent = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'discordAgent',
      position: {
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 100
      },
      data: {
        type: 'discordAgent',
        framework: 'discordAgent',
        botToken: '',
        messageConfig: {},
        onChange: (newData) => handleNodeDataChange(newNode.id, newData)
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddTelegramAgent = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'telegramAgent',
      position: {
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 100
      },
              data: {
        type: 'telegramAgent',
        framework: 'telegramAgent',
        botToken: '',
        messageConfig: {},
        onChange: (newData) => handleNodeDataChange(newNode.id, newData)
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddTwitterKOL = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'twitterKOL',
      position: {
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 100
      },
      data: {
        type: 'twitterKOL',
        kolList: [],
        onChange: (newData) => handleNodeDataChange(newNode.id, newData)
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddWebViewNode = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'webview',
      position: { x: 250, y: 50 },
            data: {
        url: '',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 1}`, newData)
      }
    };
    setNodes([...nodes, newNode]);
  };

  const handleRunFlow = async () => {
    try {
      // Format nodes to include only necessary data
      const formattedNodes = nodes.map(node => ({
        id: node.id,
        type: node.data.type || node.type, // Prioritize data.type
              data: {
                ...node.data,
          // Include any specific data needed by the handlers
          contractAddress: node.data.contractAddress,
          parameters: node.data.parameters,
          pullConfig: node.data.pullConfig,
          postConfig: node.data.postConfig,
          replyConfig: node.data.replyConfig,
          openAIApiKey: node.data.openAIApiKey,
          bearerToken: node.data.bearerToken
        }
      }));

      const response = await fetch('http://localhost:5002/execute-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: formattedNodes,
          edges
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update nodes with results
      setNodes(nodes.map(node => {
        const nodeResult = result.results[node.id];
        if (nodeResult) {
          return {
            ...node,
            data: {
              ...node.data,
              output: nodeResult
            }
          };
        }
        return node;
      }));

    } catch (error) {
      console.error('Error executing flow:', error);
      alert('Error executing flow: ' + error.message);
    }
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
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
                          <li>
                            <button
                              className="import-agent-button discord-agent-button"
                              onClick={handleAddDiscordAgent}
                            >
                              <span className="button-icon">🤖</span>
                              Discord Agent
                            </button>
                            <p className="agent-description">
                              Eliza-based Discord agent for sending and receiving messages.
                            </p>
                          </li>
                          <li>
                            <button
                              className="import-agent-button telegram-agent-button"
                              onClick={handleAddTelegramAgent}
                            >
                              <span className="button-icon">🤖</span>
                              Telegram Agent
                            </button>
                            <p className="agent-description">
                              Eliza-based Telegram agent for sending and receiving messages.
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
                              className="import-agent-button trading-agent-button"
                              onClick={handleAddTradingAgent}
                            >
                              <span className="button-icon">🤖</span>
                              Trading Agent
                            </button>
                            <p className="agent-description">
                              Automated trading agent for various DeFi protocols.
                            </p>
                          </li>
                          <li>
                            <button
                              className="import-agent-button analyst-agent-button"
                              onClick={handleAddAnalystAgent}
                            >
                              <span className="button-icon">📈</span>
                              Analyst Agent
                            </button>
                            <p className="agent-description">
                              Analyzes on-chain data and provides insights.
                            </p>
                          </li>
                        </ul>
                      )}
                    </div>

                    {/* Data Hub Folder */}
                    <div className="marketplace-folder">
                      <div className="folder-header" onClick={() => setIsDataHubOpen(!isDataHubOpen)}>
                        <span className="folder-icon">{isDataHubOpen ? '📂' : '📁'}</span>
                        <span className="folder-name">Data Hub</span>
                        <span className="folder-arrow">{isDataHubOpen ? '▼' : '▶'}</span>
                      </div>

                      {isDataHubOpen && (
                        <ul className="import-agents-list">
                          <li>
                            <button
                              className="import-agent-button smart-money-follower-button"
                              onClick={handleAddSmartMoneyFollower}
                            >
                              <span className="button-icon">💰</span>
                              Smart Money Address
                            </button>
                            <p className="agent-description">
                              Follows transactions of multiple smart money addresses.
                            </p>
                          </li>
                          <li>
                            <button
                              className="import-agent-button twitter-kol-button"
                              onClick={handleAddTwitterKOL}
                            >
                              <span className="button-icon">🐦</span>
                              Twitter KOL List
                            </button>
                            <p className="agent-description">
                              Manages a list of Twitter KOLs.
                            </p>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add Web View Button */}
                <div className="node-buttons-group">
                  <h4>Tools</h4>
                  <button
                    onClick={handleAddWebViewNode}
                    className="add-node-button webview-button"
                  >
                    <span className="button-icon">🌐</span>
                    Web View
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
              <ErrorBoundary>
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
              </ErrorBoundary>
      </div>
    </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}