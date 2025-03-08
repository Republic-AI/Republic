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
import PromptToAgentNode from './PromptToAgentNode';

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
  sticker: ({ data }) => (
    <div className={data.className}>
      {data.label}
    </div>
  ),
  promptToAgent: PromptToAgentNode
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSocialMediaHubOpen, setIsSocialMediaHubOpen] = useState(false);
  const [isDefiHubOpen, setIsDefiHubOpen] = useState(false);
  const [isDataHubOpen, setIsDataHubOpen] = useState(false);
  const [isMultiAgentMarketOpen, setIsMultiAgentMarketOpen] = useState(false);
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
        const incomingEdges = edges.filter((edge) => edge.target === node.id);

        if (incomingEdges.length === 0) {
          return node;
        }

        const inputs = incomingEdges.map((edge) => {
          const sourceNode = prevNodes.find((n) => n.id === edge.source);
          return {
            source: edge.source,
            output: sourceNode?.data?.output,
          };
        });

        let newData = {
          ...node.data,
          inputs: inputs,
        };

        if (node.type === 'analystAgent') {
          const contractInput = inputs.find(input => input.output?.content && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input.output.content));
          if (contractInput) {
            newData.contractAddress = contractInput.output.content;
          }
        }

        if (node.type === 'webview') {
          const contractInput = inputs.find(input => input.output?.content && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input.output.content));
          if (contractInput) {
            const newCA = contractInput.output.content;
            newData.tokenCA = newCA;
            newData.url = `https://www.gmgn.cc/kline/sol/${newCA}`;
          }
        }

        return {
          ...node,
          data: newData,
        };
      });
    });
  }, [edges, nodes, setNodes]);

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

  const handleAddKChartNode = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'webview',
      position: { x: 250, y: 50 },
      data: {
        type: 'kchart',
        url: '',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 1}`, newData)
      }
    };
    setNodes([...nodes, newNode]);
  };

  const handleAddCopyTransactionFlow = () => {
    // Set base position for KOL node with much more spacing
    const kolNodeX = 100;
    const kolNodeY = 300; // Significantly increased vertical spacing
    
    // Create instruction sticker node - position it above the KOL node
    const instructionSticker = {
      id: `node-${nodes.length + 1}`,
      type: 'sticker',
      position: { 
        x: kolNodeX,  // Same x as KOL node
        y: 50  // Fixed position at top
      },
      data: {
        type: 'sticker',
        label: `How to use Copy Transaction Flow:
1. Add KOL accounts in Twitter KOL List
2. Check "CA Mode" in Twitter Agent
3. Set parameters in Analyst Agent
4. Configure Trading Agent settings
5. Click "Run Flow" to start`,
        className: 'instruction-label'
      }
    };

    // Create nodes with specific positions - much more spacing between nodes
    const kolNode = {
      id: `node-${nodes.length + 2}`,
      type: 'twitterKOL',
      position: { x: kolNodeX, y: kolNodeY },
      data: {
        type: 'twitterKOL',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 2}`, newData)
      }
    };

    const twitterNode = {
      id: `node-${nodes.length + 3}`,
      type: 'twitterAgent',
      position: { x: 500, y: 300 }, // Increased horizontal spacing
      data: {
        type: 'twitterAgent',
        pullConfig: {
          isOriginalCA: true // Enable CA Mode by default
        },
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 3}`, newData)
      }
    };

    const analystNode = {
      id: `node-${nodes.length + 4}`,
      type: 'analystAgent',
      position: { x: 900, y: 300 }, // Increased horizontal spacing
      data: {
        type: 'analystAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 4}`, newData)
      }
    };

    const webviewNode = {
      id: `node-${nodes.length + 5}`,
      type: 'webview',
      position: { x: 1300, y: 100 }, // Positioned higher for better visibility
            data: {
        type: 'webview',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 5}`, newData)
      }
    };

    const tradingNode = {
      id: `node-${nodes.length + 6}`,
      type: 'tradingAgent',
      position: { x: 1300, y: 500 }, // Much more vertical separation
      data: {
        type: 'tradingAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 6}`, newData)
      }
    };

    // Create edges to connect the nodes
    const newEdges = [
      {
        id: `edge-${edges.length + 1}`,
        source: kolNode.id,
        target: twitterNode.id,
      },
      {
        id: `edge-${edges.length + 2}`,
        source: twitterNode.id,
        target: analystNode.id,
      },
      {
        id: `edge-${edges.length + 3}`,
        source: analystNode.id,
        target: webviewNode.id,
      },
      {
        id: `edge-${edges.length + 4}`,
        source: analystNode.id,
        target: tradingNode.id,
      },
    ];

    // Add all new nodes and edges
    setNodes([...nodes, instructionSticker, kolNode, twitterNode, analystNode, webviewNode, tradingNode]);
    setEdges([...edges, ...newEdges]);
  };

  // Update Social Sentiment Monitor flow layout with Twitter posting capability
  const handleAddSocialSentimentFlow = () => {
    // Create instruction sticker node
    const instructionSticker = {
      id: `node-${nodes.length + 1}`,
      type: 'sticker',
      position: { x: -500, y: 0 },
      data: {
        type: 'sticker',
        label: `How to use Social Sentiment Monitor:
1. Add KOL accounts in Twitter KOL List
2. Configure Twitter, Discord, and Telegram agents for monitoring
3. Set parameters in Analyst Agent for sentiment analysis
4. Configure Twitter Posting Agent to share results
5. The system will monitor sentiment and post updates to Twitter`,
        className: 'instruction-label'
      }
    };

    // Row 1: KOL List and Twitter Agent side by side
    const kolNode = {
      id: `node-${nodes.length + 2}`,
      type: 'twitterKOL',
      position: { x: -500, y: 300 },
      data: {
        type: 'twitterKOL',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 2}`, newData)
      }
    };

    const twitterMonitorNode = {
      id: `node-${nodes.length + 3}`,
      type: 'twitterAgent',
      position: { x: 100, y: 100 },
      data: {
        type: 'twitterAgent',
        activeSubAgent: 'pull', // Set to pull mode for monitoring
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 3}`, newData)
      }
    };

    // Column of social agents with large vertical spacing
    const discordNode = {
      id: `node-${nodes.length + 4}`,
      type: 'discordAgent',
      position: { x: 100, y: 1000 },
      data: {
        type: 'discordAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 4}`, newData)
      }
    };

    const telegramNode = {
      id: `node-${nodes.length + 5}`,
      type: 'telegramAgent',
      position: { x: 100, y: 1800 },
      data: {
        type: 'telegramAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 5}`, newData)
      }
    };

    // Row 2: Discord Agent, Analyst Agent, and Twitter Posting Agent side by side
    const analystNode = {
      id: `node-${nodes.length + 6}`,
      type: 'analystAgent',
      position: { x: 500, y: 600 },
      data: {
        type: 'analystAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 6}`, newData)
      }
    };

    // Replace Trading Agent with Twitter Posting Agent
    const twitterPostNode = {
      id: `node-${nodes.length + 7}`,
      type: 'twitterAgent',
      position: { x: 900, y: 600 },
      data: {
        type: 'twitterAgent',
        activeSubAgent: 'post', // Set to post mode for tweeting results
        postConfig: {
          tweet: 'Market Sentiment Update: {sentiment}. Top mentioned tokens: {tokens}. Overall market mood: {mood}.'
        },
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 7}`, newData)
      }
    };

    // Create edges with the new layout
    const newEdges = [
      // Connect KOL List to Twitter Monitor Agent
      {
        id: `edge-${edges.length + 1}`,
        source: kolNode.id,
        target: twitterMonitorNode.id,
      },
      // Connect Twitter Monitor Agent to Analyst Agent
      {
        id: `edge-${edges.length + 2}`,
        source: twitterMonitorNode.id,
        target: analystNode.id,
      },
      // Connect Discord Agent to Analyst Agent
      {
        id: `edge-${edges.length + 3}`,
        source: discordNode.id,
        target: analystNode.id,
      },
      // Connect Telegram Agent to Analyst Agent
      {
        id: `edge-${edges.length + 4}`,
        source: telegramNode.id,
        target: analystNode.id,
      },
      // Connect Analyst Agent to Twitter Posting Agent
      {
        id: `edge-${edges.length + 5}`,
        source: analystNode.id,
        target: twitterPostNode.id,
      },
    ];

    // Add all new nodes and edges
    setNodes([...nodes, instructionSticker, kolNode, twitterMonitorNode, discordNode, telegramNode, analystNode, twitterPostNode]);
    setEdges([...edges, ...newEdges]);
  };

  // Update Algorithmic Trading Strategies flow layout with much more vertical space
  const handleAddAlgoTradingFlow = () => {
    // Create instruction sticker node
    const instructionSticker = {
      id: `node-${nodes.length + 1}`,
      type: 'sticker',
      position: { x: 100, y: 50 },
      data: {
        type: 'sticker',
        label: `How to use Algorithmic Trading Strategies:
1. Configure data sources (Twitter, Smart Money, Analyst)
2. Set strategy parameters in Trading Agent
3. Use AI prompts to define custom strategies
4. Monitor performance in K Chart
5. The system will execute trades based on your strategy`,
        className: 'instruction-label'
      }
    };

    // Data Sources - Row 1
    const kolNode = {
      id: `node-${nodes.length + 2}`,
      type: 'twitterKOL',
      position: { x: 100, y: 300 }, // Significantly increased vertical spacing
      data: {
        type: 'twitterKOL',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 2}`, newData)
      }
    };

    const twitterNode = {
      id: `node-${nodes.length + 3}`,
      type: 'twitterAgent',
      position: { x: 100, y: 600 }, // Significantly increased vertical spacing
      data: {
        type: 'twitterAgent',
        pullConfig: {
          isOriginalCA: true
        },
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 3}`, newData)
      }
    };

    const smartMoneyNode = {
      id: `node-${nodes.length + 4}`,
      type: 'smartMoneyFollower',
      position: { x: 500, y: 300 }, // Increased horizontal spacing
      data: {
        type: 'smartMoneyFollower',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 4}`, newData)
      }
    };

    // Analysis Layer - Row 2
    const analystNode = {
      id: `node-${nodes.length + 5}`,
      type: 'analystAgent',
      position: { x: 500, y: 600 }, // Significantly increased vertical spacing
      data: {
        type: 'analystAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 5}`, newData)
      }
    };

    const backtestNode = {
      id: `node-${nodes.length + 6}`,
      type: 'custom',
      position: { x: 900, y: 300 }, // Increased horizontal spacing
      data: {
        type: 'custom',
        framework: 'backtest',
        label: 'Backtest Engine',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 6}`, newData)
      }
    };

    // Strategy & Execution Layer - Row 3
    const strategyNode = {
      id: `node-${nodes.length + 7}`,
      type: 'custom',
      position: { x: 900, y: 600 }, // Significantly increased vertical spacing
      data: {
        type: 'custom',
        framework: 'strategy',
        label: 'Strategy Optimizer',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 7}`, newData)
      }
    };

    const tradingNode = {
      id: `node-${nodes.length + 8}`,
      type: 'tradingAgent',
      position: { x: 1300, y: 600 }, // Increased horizontal spacing
      data: {
        type: 'tradingAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 8}`, newData)
      }
    };

    // Output Layer - Row 4
    const webviewNode = {
      id: `node-${nodes.length + 9}`,
      type: 'webview',
      position: { x: 1300, y: 300 }, // Increased horizontal spacing
      data: {
        type: 'webview',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 9}`, newData)
      }
    };

    const performanceNode = {
      id: `node-${nodes.length + 10}`,
      type: 'custom',
      position: { x: 1300, y: 900 }, // Significantly increased vertical spacing
      data: {
        type: 'custom',
        framework: 'performance',
        label: 'Performance Dashboard',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 10}`, newData)
      }
    };

    // Create edges with improved layout
    const newEdges = [
      // Data Source Connections
      {
        id: `edge-${edges.length + 1}`,
        source: kolNode.id,
        target: twitterNode.id,
      },
      {
        id: `edge-${edges.length + 2}`,
        source: twitterNode.id,
        target: analystNode.id,
      },
      {
        id: `edge-${edges.length + 3}`,
        source: smartMoneyNode.id,
        target: analystNode.id,
      },
      
      // Analysis Connections
      {
        id: `edge-${edges.length + 4}`,
        source: analystNode.id,
        target: backtestNode.id,
      },
      {
        id: `edge-${edges.length + 5}`,
        source: analystNode.id,
        target: strategyNode.id,
      },
      {
        id: `edge-${edges.length + 6}`,
        source: backtestNode.id,
        target: strategyNode.id,
      },
      
      // Strategy & Execution Connections
      {
        id: `edge-${edges.length + 7}`,
        source: strategyNode.id,
        target: tradingNode.id,
      },
      
      // Output Connections
      {
        id: `edge-${edges.length + 8}`,
        source: tradingNode.id,
        target: webviewNode.id,
      },
      {
        id: `edge-${edges.length + 9}`,
        source: tradingNode.id,
        target: performanceNode.id,
      },
    ];

    // Add all new nodes and edges
    setNodes([...nodes, instructionSticker, kolNode, twitterNode, smartMoneyNode, analystNode, 
      backtestNode, strategyNode, tradingNode, webviewNode, performanceNode]);
    setEdges([...edges, ...newEdges]);
  };

  // Update Risk Management & Automated Alerts flow layout with much more vertical space
  const handleAddRiskManagementFlow = () => {
    // Create instruction sticker node
    const instructionSticker = {
      id: `node-${nodes.length + 1}`,
      type: 'sticker',
      position: { x: 100, y: 50 },
      data: {
        type: 'sticker',
        label: `How to use Risk Management & Automated Alerts:
1. Configure portfolio tokens in Smart Money Follower
2. Set risk thresholds in Risk Manager node
3. Configure alert preferences in Alert System
4. The system will monitor your portfolio 24/7
5. Automated protective actions trigger when risks detected`,
        className: 'instruction-label'
      }
    };

    // Portfolio Monitoring Layer - Row 1
    const smartMoneyNode = {
      id: `node-${nodes.length + 2}`,
      type: 'smartMoneyFollower',
      position: { x: 100, y: 300 }, // Significantly increased vertical spacing
      data: {
        type: 'smartMoneyFollower',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 2}`, newData)
      }
    };

    const twitterNode = {
      id: `node-${nodes.length + 3}`,
      type: 'twitterAgent',
      position: { x: 500, y: 300 }, // Increased horizontal spacing
      data: {
        type: 'twitterAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 3}`, newData)
      }
    };

    // Risk Analysis Layer - Row 2
    const analystNode = {
      id: `node-${nodes.length + 4}`,
      type: 'analystAgent',
      position: { x: 100, y: 600 }, // Significantly increased vertical spacing
      data: {
        type: 'analystAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 4}`, newData)
      }
    };

    const riskManagerNode = {
      id: `node-${nodes.length + 5}`,
      type: 'custom',
      position: { x: 500, y: 600 }, // Significantly increased vertical spacing
      data: {
        type: 'custom',
        framework: 'riskManager',
        label: 'Risk Manager',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 5}`, newData)
      }
    };

    // Action Layer - Row 3
    const alertSystemNode = {
      id: `node-${nodes.length + 6}`,
      type: 'custom',
      position: { x: 900, y: 300 }, // Increased horizontal spacing
      data: {
        type: 'custom',
        framework: 'alertSystem',
        label: 'Alert System',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 6}`, newData)
      }
    };

    const tradingNode = {
      id: `node-${nodes.length + 7}`,
      type: 'tradingAgent',
      position: { x: 900, y: 600 }, // Significantly increased vertical spacing
      data: {
        type: 'tradingAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 7}`, newData)
      }
    };

    const emergencyActionNode = {
      id: `node-${nodes.length + 8}`,
      type: 'custom',
      position: { x: 900, y: 900 }, // Significantly increased vertical spacing
      data: {
        type: 'custom',
        framework: 'emergencyAction',
        label: 'Emergency Actions',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 8}`, newData)
      }
    };

    // Monitoring Layer - Row 4
    const webviewNode = {
      id: `node-${nodes.length + 9}`,
      type: 'webview',
      position: { x: 1300, y: 450 }, // Increased horizontal spacing and positioned between rows
      data: {
        type: 'webview',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 9}`, newData)
      }
    };

    const dashboardNode = {
      id: `node-${nodes.length + 10}`,
      type: 'custom',
      position: { x: 1300, y: 750 }, // Increased horizontal spacing and positioned between rows
      data: {
        type: 'custom',
        framework: 'dashboard',
        label: 'Risk Dashboard',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 10}`, newData)
      }
    };

    // Create edges with improved layout
    const newEdges = [
      // Portfolio Monitoring Connections
      {
        id: `edge-${edges.length + 1}`,
        source: smartMoneyNode.id,
        target: analystNode.id,
      },
      {
        id: `edge-${edges.length + 2}`,
        source: twitterNode.id,
        target: analystNode.id,
      },
      
      // Risk Analysis Connections
      {
        id: `edge-${edges.length + 3}`,
        source: analystNode.id,
        target: riskManagerNode.id,
      },
      
      // Action Connections
      {
        id: `edge-${edges.length + 4}`,
        source: riskManagerNode.id,
        target: alertSystemNode.id,
      },
      {
        id: `edge-${edges.length + 5}`,
        source: riskManagerNode.id,
        target: tradingNode.id,
      },
      {
        id: `edge-${edges.length + 6}`,
        source: riskManagerNode.id,
        target: emergencyActionNode.id,
      },
      
      // Monitoring Connections
      {
        id: `edge-${edges.length + 7}`,
        source: tradingNode.id,
        target: webviewNode.id,
      },
      {
        id: `edge-${edges.length + 8}`,
        source: riskManagerNode.id,
        target: dashboardNode.id,
      },
    ];

    // Add all new nodes and edges
    setNodes([...nodes, instructionSticker, smartMoneyNode, twitterNode, analystNode, 
      riskManagerNode, alertSystemNode, tradingNode, emergencyActionNode, webviewNode, dashboardNode]);
    setEdges([...edges, ...newEdges]);
  };

  const handleAddPromptToMultiAgentFlow = () => {
    // Create instruction sticker node
    const instructionSticker = {
      id: `node-${nodes.length + 1}`,
      type: 'sticker',
      position: { x: 100, y: 50 },
      data: {
        type: 'sticker',
        label: `How to use Prompt to Multi-Agent:
1. Enter a detailed description of the multi-agent system you want to create
2. Select the AI model to use for generation
3. Enter your API key for the selected model
4. Click "Generate Multi-Agent System"
5. The AI will design and create the multi-agent flow for you`,
        className: 'instruction-label'
      }
    };

    // Create the PromptToAgent node
    const promptToAgentNode = {
      id: `node-${nodes.length + 2}`,
      type: 'promptToAgent',
      position: { x: 100, y: 300 },
      data: {
        type: 'promptToAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 2}`, newData),
        onGenerateFlow: (flow) => handleGenerateFlow(flow, `node-${nodes.length + 2}`)
      }
    };

    // Add the new nodes
    setNodes([...nodes, instructionSticker, promptToAgentNode]);
  };

  const handleGenerateFlow = (flow, sourceNodeId) => {
    if (!flow || !flow.nodes || !flow.edges) {
      console.error("Invalid flow description received");
      return;
    }

    // Calculate starting node ID to avoid conflicts
    const startNodeId = nodes.length + 3; // +2 for the existing nodes, +1 to start with the next one
    
    // Create a mapping of node IDs
    const nodeIdMapping = {};
    
    // Create the new nodes
    const newNodes = flow.nodes.map((nodeDesc, index) => {
      const newId = `node-${startNodeId + index}`;
      nodeIdMapping[`node-${index + 1}`] = newId; // Map the flow's node IDs to our actual node IDs
      
      return {
        id: newId,
        type: nodeDesc.type,
        position: nodeDesc.position,
        data: {
          type: nodeDesc.type,
          ...nodeDesc.config,
          onChange: (newData) => handleNodeDataChange(newId, newData)
        }
      };
    });
    
    // Create the new edges, mapping the source and target IDs
    const newEdges = flow.edges.map((edge, index) => {
      return {
        id: `edge-${edges.length + index + 1}`,
        source: nodeIdMapping[edge.source] || edge.source,
        target: nodeIdMapping[edge.target] || edge.target
      };
    });
    
    // Add the flow title as a sticker node
    const titleNode = {
      id: `node-${startNodeId + newNodes.length}`,
      type: 'sticker',
      position: { x: 500, y: 50 },
      data: {
        type: 'sticker',
        label: `${flow.title}\n\n${flow.description}`,
        className: 'instruction-label'
      }
    };
    
    // Add all the new nodes and edges
    setNodes([...nodes, ...newNodes, titleNode]);
    setEdges([...edges, ...newEdges]);
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
                          <li>
                            <button
                              className="import-agent-button kchart-button"
                              onClick={handleAddKChartNode}
                            >
                              <span className="button-icon">📊</span>
                              K Chart
                            </button>
                            <p className="agent-description">
                              Interactive price chart and technical analysis view.
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

                {/* Multi-agent Use Cases section */}
                <div className="node-buttons-group">
                  <h4>Multi-agent Use Cases</h4>
                  
                  {/* Add the new Prompt to Multi-Agent button at the top */}
                  <button
                    className="import-agent-button prompt-to-agent-button"
                    onClick={handleAddPromptToMultiAgentFlow}
                  >
                    <span className="button-icon">✨</span>
                    From Prompt to Multi-Agent
                  </button>
                  <p className="agent-description">
                    Let AI design and create a custom multi-agent system based on your description.
                  </p>
                  
                  <button
                    className="import-agent-button copy-transaction-button"
                    onClick={handleAddCopyTransactionFlow}
                  >
                    <span className="button-icon">🔄</span>
                    Monitor &amp; Copy Transactions
                  </button>
                  <p className="agent-description">
                    Creates a complete flow for monitoring and copying transactions.
                  </p>
                  
                  <button
                    className="import-agent-button social-sentiment-button"
                    onClick={handleAddSocialSentimentFlow}
                  >
                    <span className="button-icon">📊</span>
                    Social Sentiment Monitor
                  </button>
                  <p className="agent-description">
                    Monitors sentiment across social platforms and posts analysis results to Twitter.
                  </p>
                  
                  <button
                    className="import-agent-button algo-trading-button"
                    onClick={handleAddAlgoTradingFlow}
                  >
                    <span className="button-icon">📈</span>
                    Algorithmic Trading Strategies
                  </button>
                  <p className="agent-description">
                    Advanced multi-source trading system with backtesting, optimization, and adaptive strategies.
                  </p>
                  
                  <button
                    className="import-agent-button risk-management-button"
                    onClick={handleAddRiskManagementFlow}
                  >
                    <span className="button-icon">🛡️</span>
                    Risk Management &amp; Alerts
                  </button>
                  <p className="agent-description">
                    Protects your portfolio with automated risk monitoring, alerts, and protective actions.
                  </p>
                </div>

                {/* Add Web View Button */}
                <div className="node-buttons-group">
                  <h4>Tools</h4>
                  {/* Web View button removed from here */}
          </div>

          {/* Run Flow Button */}
          <button className="run-flow-button" disabled>
            Flow is Running
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