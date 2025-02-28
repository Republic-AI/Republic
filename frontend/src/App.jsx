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
  sticker: ({ data }) => (
    <div className={data.className}>
      {data.label}
    </div>
  ),
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
    // Set base position for KOL node
    const kolNodeX = 100;
    const kolNodeY = 200;
    
    // Create instruction sticker node - position it above the KOL node
    const instructionSticker = {
      id: `node-${nodes.length + 1}`,
      type: 'sticker',
      position: { 
        x: kolNodeX,  // Same x as KOL node
        y: kolNodeY - 300  // 100px above KOL node
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

    // Create nodes with specific positions - more spacing between nodes
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
      position: { x: 500, y: 200 },
      data: {
        type: 'twitterAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 3}`, newData)
      }
    };

    const analystNode = {
      id: `node-${nodes.length + 4}`,
      type: 'analystAgent',
      position: { x: 900, y: 200 },
      data: {
        type: 'analystAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 4}`, newData)
      }
    };

    const webviewNode = {
      id: `node-${nodes.length + 5}`,
      type: 'webview',
      position: { x: 1300, y: 50 },
            data: {
        type: 'webview',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 5}`, newData)
      }
    };

    const tradingNode = {
      id: `node-${nodes.length + 6}`,
      type: 'tradingAgent',
      position: { x: 1300, y: 350 },
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

  // Update Social Sentiment Monitor flow layout
  const handleAddSocialSentimentFlow = () => {
    // Create instruction sticker node
    const instructionSticker = {
      id: `node-${nodes.length + 1}`,
      type: 'sticker',
      position: { x: 100, y: 50 },
      data: {
        type: 'sticker',
        label: `How to use Social Sentiment Monitor:
1. Add KOL accounts in Twitter KOL List
2. Configure Twitter, Discord, and Telegram agents
3. Set parameters in Analyst Agent
4. Configure Trading Agent settings
5. The system will monitor sentiment across platforms`,
        className: 'instruction-label'
      }
    };

    // Create Twitter KOL List node - Row 1
    const kolNode = {
      id: `node-${nodes.length + 2}`,
      type: 'twitterKOL',
      position: { x: 100, y: 200 },
      data: {
        type: 'twitterKOL',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 2}`, newData)
      }
    };

    // Create Social Media Agents - Row 2
    const twitterNode = {
      id: `node-${nodes.length + 3}`,
      type: 'twitterAgent',
      position: { x: 100, y: 400 },
      data: {
        type: 'twitterAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 3}`, newData)
      }
    };

    const discordNode = {
      id: `node-${nodes.length + 4}`,
      type: 'discordAgent',
      position: { x: 450, y: 400 },
      data: {
        type: 'discordAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 4}`, newData)
      }
    };

    const telegramNode = {
      id: `node-${nodes.length + 5}`,
      type: 'telegramAgent',
      position: { x: 800, y: 400 },
      data: {
        type: 'telegramAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 5}`, newData)
      }
    };

    // Create Analysis and Trading - Row 3
    const analystNode = {
      id: `node-${nodes.length + 6}`,
      type: 'analystAgent',
      position: { x: 450, y: 600 },
      data: {
        type: 'analystAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 6}`, newData)
      }
    };

    const tradingNode = {
      id: `node-${nodes.length + 7}`,
      type: 'tradingAgent',
      position: { x: 800, y: 600 },
      data: {
        type: 'tradingAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 7}`, newData)
      }
    };

    // Create edges with improved layout
    const newEdges = [
      // Connect KOL List to Twitter Agent
      {
        id: `edge-${edges.length + 1}`,
        source: kolNode.id,
        target: twitterNode.id,
      },
      // Connect Twitter Agent to Analyst Agent
      {
        id: `edge-${edges.length + 2}`,
        source: twitterNode.id,
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
      // Connect Analyst Agent to Trading Agent
      {
        id: `edge-${edges.length + 5}`,
        source: analystNode.id,
        target: tradingNode.id,
      },
    ];

    // Add all new nodes and edges
    setNodes([...nodes, instructionSticker, kolNode, twitterNode, discordNode, telegramNode, analystNode, tradingNode]);
    setEdges([...edges, ...newEdges]);
  };

  // Update Real-Time Signal Monitoring flow layout
  const handleAddSignalMonitoringFlow = () => {
    // Create instruction sticker node
    const instructionSticker = {
      id: `node-${nodes.length + 1}`,
      type: 'sticker',
      position: { x: 100, y: 50 },
      data: {
        type: 'sticker',
        label: `How to use Real-Time Signal Monitoring:
1. Add KOL accounts in Twitter KOL List
2. Configure Twitter Agent with CA Mode enabled
3. Set alert parameters in Analyst Agent
4. The system will monitor for signals and alert you
5. View charts in K Chart node when signals are detected`,
        className: 'instruction-label'
      }
    };

    // Create Twitter KOL List node - Row 1
    const kolNode = {
      id: `node-${nodes.length + 2}`,
      type: 'twitterKOL',
      position: { x: 100, y: 200 },
      data: {
        type: 'twitterKOL',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 2}`, newData)
      }
    };

    // Create Twitter Agent node - Row 2
    const twitterNode = {
      id: `node-${nodes.length + 3}`,
      type: 'twitterAgent',
      position: { x: 100, y: 400 },
      data: {
        type: 'twitterAgent',
        pullConfig: {
          isOriginalCA: true // Enable CA Mode by default
        },
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 3}`, newData)
      }
    };

    // Create Analyst Agent node - Row 3
    const analystNode = {
      id: `node-${nodes.length + 4}`,
      type: 'analystAgent',
      position: { x: 450, y: 400 },
      data: {
        type: 'analystAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 4}`, newData)
      }
    };

    // Create Output nodes - Row 4
    const webviewNode = {
      id: `node-${nodes.length + 5}`,
      type: 'webview',
      position: { x: 450, y: 600 },
      data: {
        type: 'webview',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 5}`, newData)
      }
    };

    const notificationNode = {
      id: `node-${nodes.length + 6}`,
      type: 'custom',
      position: { x: 800, y: 400 },
      data: {
        type: 'custom',
        framework: 'notification',
        label: 'Signal Alerts',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 6}`, newData)
      }
    };

    // Create edges with improved layout
    const newEdges = [
      // Connect KOL List to Twitter Agent
      {
        id: `edge-${edges.length + 1}`,
        source: kolNode.id,
        target: twitterNode.id,
      },
      // Connect Twitter Agent to Analyst Agent
      {
        id: `edge-${edges.length + 2}`,
        source: twitterNode.id,
        target: analystNode.id,
      },
      // Connect Analyst Agent to WebView Node
      {
        id: `edge-${edges.length + 3}`,
        source: analystNode.id,
        target: webviewNode.id,
      },
      // Connect Analyst Agent to Notification Node
      {
        id: `edge-${edges.length + 4}`,
        source: analystNode.id,
        target: notificationNode.id,
      },
    ];

    // Add all new nodes and edges
    setNodes([...nodes, instructionSticker, kolNode, twitterNode, analystNode, webviewNode, notificationNode]);
    setEdges([...edges, ...newEdges]);
  };

  // Update Algorithmic Trading Strategies flow layout
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
      position: { x: 100, y: 200 },
      data: {
        type: 'twitterKOL',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 2}`, newData)
      }
    };

    const twitterNode = {
      id: `node-${nodes.length + 3}`,
      type: 'twitterAgent',
      position: { x: 100, y: 400 },
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
      position: { x: 450, y: 200 },
      data: {
        type: 'smartMoneyFollower',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 4}`, newData)
      }
    };

    // Analysis Layer - Row 2
    const analystNode = {
      id: `node-${nodes.length + 5}`,
      type: 'analystAgent',
      position: { x: 450, y: 400 },
      data: {
        type: 'analystAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 5}`, newData)
      }
    };

    const backtestNode = {
      id: `node-${nodes.length + 6}`,
      type: 'custom',
      position: { x: 800, y: 200 },
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
      position: { x: 800, y: 400 },
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
      position: { x: 1150, y: 400 },
      data: {
        type: 'tradingAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 8}`, newData)
      }
    };

    // Output Layer - Row 4
    const webviewNode = {
      id: `node-${nodes.length + 9}`,
      type: 'webview',
      position: { x: 1150, y: 200 },
      data: {
        type: 'webview',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 9}`, newData)
      }
    };

    const performanceNode = {
      id: `node-${nodes.length + 10}`,
      type: 'custom',
      position: { x: 1150, y: 600 },
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

  // Update Risk Management & Automated Alerts flow layout
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
      position: { x: 100, y: 200 },
      data: {
        type: 'smartMoneyFollower',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 2}`, newData)
      }
    };

    const twitterNode = {
      id: `node-${nodes.length + 3}`,
      type: 'twitterAgent',
      position: { x: 450, y: 200 },
      data: {
        type: 'twitterAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 3}`, newData)
      }
    };

    // Risk Analysis Layer - Row 2
    const analystNode = {
      id: `node-${nodes.length + 4}`,
      type: 'analystAgent',
      position: { x: 100, y: 400 },
      data: {
        type: 'analystAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 4}`, newData)
      }
    };

    const riskManagerNode = {
      id: `node-${nodes.length + 5}`,
      type: 'custom',
      position: { x: 450, y: 400 },
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
      position: { x: 800, y: 200 },
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
      position: { x: 800, y: 400 },
      data: {
        type: 'tradingAgent',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 7}`, newData)
      }
    };

    const emergencyActionNode = {
      id: `node-${nodes.length + 8}`,
      type: 'custom',
      position: { x: 800, y: 600 },
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
      position: { x: 1150, y: 300 },
      data: {
        type: 'webview',
        onChange: (newData) => handleNodeDataChange(`node-${nodes.length + 9}`, newData)
      }
    };

    const dashboardNode = {
      id: `node-${nodes.length + 10}`,
      type: 'custom',
      position: { x: 1150, y: 500 },
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

                {/* Add Multi-agent Marketplace section */}
                <div className="node-buttons-group">
                  <h4>Multi-agent Marketplace</h4>
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
                    Monitors sentiment across Twitter, Discord, and Telegram to inform trading decisions.
                  </p>
                  
                  <button
                    className="import-agent-button signal-monitoring-button"
                    onClick={handleAddSignalMonitoringFlow}
                  >
                    <span className="button-icon">🔔</span>
                    Real-Time Signal Monitoring
                  </button>
                  <p className="agent-description">
                    Monitors social feeds for signals and provides real-time alerts when influential figures post about tokens.
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