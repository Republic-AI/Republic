import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';
import axios from 'axios';

const GMGN_API_BASE = 'https://gmgn.ai/defi/router/v1/sol';
const SOL_ADDRESS = 'So11111111111111111111111111111111111111112';

export default function TradingAgentNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [targetTokenAddress, setTargetTokenAddress] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [openAIApiKey, setOpenAIApiKey] = useState(data.openAIApiKey || '');
  const [isProcessingPrompt, setIsProcessingPrompt] = useState(false);
  const [parameters, setParameters] = useState(() => ({
    ...data.parameters,
    fixedBuy: data.parameters?.fixedBuy || 0.1,
    maxBuy: data.parameters?.maxBuy || 1,
    sellAt: data.parameters?.sellAt || 200,
    stopLoss: data.parameters?.stopLoss || 50,
    gas: data.parameters?.gas || 0.006,
    slippage: data.parameters?.slippage || 0.5,
    antiMEV: data.parameters?.antiMEV || false
  }));

  // Update target token address when receiving input from other nodes
  useEffect(() => {
    if (data.inputs && data.inputs[0]?.output?.content) {
      const content = data.inputs[0].output.content;
      // Check if content matches Solana address format
      if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(content)) {
        setTargetTokenAddress(content);
        data.onChange({
          ...data,
          targetTokenAddress: content
        });
      }
    }
  }, [data.inputs]);

  // Handle manual input of target token address
  const handleTargetTokenChange = (event) => {
    const address = event.target.value;
    setTargetTokenAddress(address);
    data.onChange({
      ...data,
      targetTokenAddress: address
    });
  };

  const handleOpenAIApiKeyChange = (event) => {
    const newKey = event.target.value;
    setOpenAIApiKey(newKey);
    data.onChange({
      ...data,
      openAIApiKey: newKey
    });
  };

  // Handle AI prompt change
  const handleAiPromptChange = (event) => {
    setAiPrompt(event.target.value);
  };

  // Process AI prompt to update trading parameters
  const handleProcessAiPrompt = async () => {
    if (!aiPrompt) {
      alert('Please enter an AI prompt');
      return;
    }
    if (!openAIApiKey) {
      alert('Please enter your OpenAI API key');
      return;
    }

    setIsProcessingPrompt(true);
    try {
      const response = await fetch('http://localhost:5002/analyze-trading-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: aiPrompt,
          currentParameters: parameters,
          openAIApiKey // Send the API key with the request
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.parameters) {
        // Update parameters with AI-extracted values
        setParameters(prevParams => ({
          ...prevParams,
          ...result.parameters
        }));
        
        // Update node data
        data.onChange({
          ...data,
          parameters: {
            ...parameters,
            ...result.parameters
          }
        });
      }
      
    } catch (error) {
      console.error('Error processing AI prompt:', error);
      alert('Error processing AI prompt: ' + error.message);
    } finally {
      setIsProcessingPrompt(false);
    }
  };

  // Check if Phantom is installed and get provider
  const getProvider = () => {
    if ('phantom' in window) {
      const provider = window.phantom?.solana;
      if (provider?.isPhantom) {
        return provider;
      }
    }
    return null;
  };

  // Check initial connection status
  useEffect(() => {
    const provider = getProvider();
    if (provider) {
      provider.on('connect', (publicKey) => {
        console.log('Connected with public key:', publicKey.toString());
        setPublicKey(publicKey);
        setWalletConnected(true);
        data.onChange({
          ...data,
          walletAddress: publicKey.toString()
        });
      });

      provider.on('disconnect', () => {
        console.log('Disconnected');
        setPublicKey(null);
        setWalletConnected(false);
        data.onChange({
          ...data,
          walletAddress: null
        });
      });

      // Check if already connected
      if (provider.isConnected) {
        setPublicKey(provider.publicKey);
        setWalletConnected(true);
        data.onChange({
          ...data,
          walletAddress: provider.publicKey.toString()
        });
      }
    }
  }, []);

  const handleConnect = async () => {
    try {
      const provider = getProvider();
      if (!provider) {
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const resp = await provider.connect();
      setPublicKey(resp.publicKey);
      setWalletConnected(true);
      data.onChange({
        ...data,
        walletAddress: resp.publicKey.toString()
      });
    } catch (err) {
      console.error('Failed to connect:', err);
      if (err.code === 4001) {
        alert('Please accept the connection request in your wallet');
      } else {
        alert(`Error connecting to wallet: ${err.message}`);
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      const provider = getProvider();
      if (provider) {
        await provider.disconnect();
        setPublicKey(null);
        setWalletConnected(false);
        data.onChange({
          ...data,
          walletAddress: null
        });
      }
    } catch (err) {
      console.error('Failed to disconnect:', err);
      alert(`Error disconnecting wallet: ${err.message}`);
    }
  };

  const handleParameterChange = (paramName, value) => {
    const updatedParams = {
      ...parameters,
      [paramName]: value,
    };
    setParameters(updatedParams);
    data.onChange({
      ...data,
      parameters: updatedParams
    });
  };

  // Function to get swap route from GMGN
  const getSwapRoute = async (inputToken, outputToken, amount, fromAddress) => {
    try {
      const response = await axios.get(`${GMGN_API_BASE}/tx/get_swap_route`, {
        params: {
          token_in_address: inputToken,
          token_out_address: outputToken,
          in_amount: amount,
          from_address: fromAddress,
          slippage: parameters.slippage,
          fee: parameters.gas,
          is_anti_mev: parameters.antiMEV
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting swap route:', error);
      throw error;
    }
  };

  // Function to submit transaction
  const submitTransaction = async (signedTx, isAntiMEV = false) => {
    try {
      const endpoint = isAntiMEV ? 
        `${GMGN_API_BASE}/tx/submit_signed_bundle_transaction` :
        `${GMGN_API_BASE}/tx/submit_signed_transaction`;

      const response = await axios.post(endpoint, {
        signed_tx: signedTx,
        ...(isAntiMEV && { from_address: data.walletAddress })
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting transaction:', error);
      throw error;
    }
  };

  // Function to check transaction status
  const checkTransactionStatus = async (hash, lastValidHeight) => {
    try {
      const response = await axios.get(`${GMGN_API_BASE}/tx/get_transaction_status`, {
        params: {
          hash: hash,
          last_valid_height: lastValidHeight
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking transaction status:', error);
      throw error;
    }
  };

  const handleBuy = async () => {
    if (!walletConnected || !targetTokenAddress) {
      alert('Please connect wallet and provide target token address');
      return;
    }

    try {
      // Get swap route from GMGN API
      const routeResponse = await fetch(
        `${GMGN_API_BASE}/tx/get_swap_route?` + 
        `token_in_address=${SOL_ADDRESS}&` +
        `token_out_address=${targetTokenAddress}&` +
        `in_amount=${parameters.fixedBuy * 1e9}&` + // Convert SOL to lamports
        `from_address=${publicKey}&` +
        `slippage=${parameters.slippage}&` +
        `fee=${parameters.gas}&` +
        `is_anti_mev=${parameters.antiMEV}`
      );

      const route = await routeResponse.json();
      
      if (!route.data || !route.data.raw_tx) {
        throw new Error('Invalid route response');
      }

      // Get the transaction from route response
      const transaction = route.data.raw_tx.swapTransaction;

      // Sign and submit transaction
      const provider = window.phantom?.solana;
      if (!provider) {
        throw new Error('Phantom wallet not found');
      }

      // Decode and sign the transaction
      const signedTx = await provider.signTransaction(transaction);
      
      // Submit signed transaction
      const submitResponse = await fetch(`${GMGN_API_BASE}/tx/submit_signed_transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signed_tx: signedTx })
      });

      const submitResult = await submitResponse.json();
      
      if (submitResult.error) {
        throw new Error(submitResult.error);
      }

      alert('Transaction submitted successfully!');

    } catch (error) {
      console.error('Error executing trade:', error);
      alert(`Error executing trade: ${error.message}`);
    }
  };

  // Add a useEffect to trigger a trade when analysis criteria are met
  useEffect(() => {
    if (data.inputs && data.inputs.length > 0) {
      const analystInput = data.inputs.find(input => input.source.startsWith('node-') && input.output?.summary?.includes('passed'));

      if (analystInput && analystInput.output.content) {
        // 1.  Get the contract address from the Analyst Agent's output.
        const caToTrade = analystInput.output.content;

        // 2.  Set the target token address in the Trading Agent's state.
        setTargetTokenAddress(caToTrade);

        // 3.  Update the node's data (so it persists).
        data.onChange({
          ...data,
          targetTokenAddress: caToTrade,
        });

        // 4.  (Optional)  Add a small delay before executing the trade,
        //     to give the UI time to update.
        setTimeout(() => {
          // 5.  Call your trading function (handleBuy, in this example).
          handleBuy(); //  <--  This assumes you have a handleBuy function.
        }, 1000); // 1-second delay
      }
    }
  }, [data.inputs, data.onChange]); // Trigger when inputs change

  return (
    <div className={`custom-node trading-agent ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle type="target" position="left" />

      <div className="node-header">
        <select className="node-type-select" value="tradingAgent" disabled>
          <option value="tradingAgent">Trading Agent</option>
        </select>
        <button
          className="config-toggle"
          onClick={() => setIsConfigOpen(!isConfigOpen)}
        >
          {isConfigOpen ? '▼' : '▲'}
        </button>
      </div>

      {isConfigOpen && (
        <div className="node-config">
          <div className="config-section">
            <h4>OpenAI API Key</h4>
            <input
              type="password"
              value={openAIApiKey}
              onChange={handleOpenAIApiKeyChange}
              placeholder="Enter your OpenAI API key"
              className="node-input api-key-input"
            />
            <div className="api-key-info">
              Required for AI prompt functionality
            </div>
          </div>

          {/* AI Prompt Section */}
          <div className="config-section">
            <h4>AI Trading Strategy</h4>
            <textarea
              value={aiPrompt}
              onChange={handleAiPromptChange}
              placeholder="Describe your trading strategy in natural language (e.g., 'Buy 0.5 SOL with 1% slippage, sell at 150% profit, and set stop loss at 30%')"
              className="node-textarea"
            />
            <button 
              onClick={handleProcessAiPrompt} 
              className="process-prompt-button"
              disabled={isProcessingPrompt}
            >
              {isProcessingPrompt ? 'Processing...' : 'Apply Strategy'}
            </button>
          </div>

          {/* Target Token Input */}
          <div className="config-section">
            <h4>Target Token</h4>
            <input
              type="text"
              value={targetTokenAddress}
              onChange={handleTargetTokenChange}
              placeholder="Enter target token address"
              className="node-input"
            />
            {data.inputs && data.inputs[0]?.output?.content && (
              <div className="input-preview">
                Connected Input: {data.inputs[0].output.content}
              </div>
            )}
          </div>

          <div className="wallet-section">
            {!walletConnected ? (
              <button onClick={handleConnect} className="connect-wallet-button">
                Connect Phantom Wallet
              </button>
            ) : (
              <div className="wallet-info">
                <div className="wallet-address">
                  Connected: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                </div>
                <button onClick={handleDisconnect} className="disconnect-wallet-button">
                  Disconnect
                </button>
              </div>
            )}
          </div>

          <div className="config-section">
            <h4>Buy Strategy</h4>
            <div className="input-group">
              <label>Fixed Buy (SOL)</label>
              <input
                type="number"
                value={parameters.fixedBuy}
                onChange={(e) => handleParameterChange('fixedBuy', parseFloat(e.target.value))}
                step="0.1"
                min="0"
              />
            </div>
            <div className="input-group">
              <label>Max Buy (SOL)</label>
              <input
                type="number"
                value={parameters.maxBuy}
                onChange={(e) => handleParameterChange('maxBuy', parseFloat(e.target.value))}
                step="0.1"
                min="0"
              />
            </div>
          </div>

          <div className="config-section">
            <h4>Sell Strategy</h4>
            <div className="input-group">
              <label>Take Profit (%)</label>
              <input
                type="number"
                value={parameters.sellAt}
                onChange={(e) => handleParameterChange('sellAt', parseFloat(e.target.value))}
                step="1"
                min="0"
              />
            </div>
            <div className="input-group">
              <label>Stop Loss (%)</label>
              <input
                type="number"
                value={parameters.stopLoss}
                onChange={(e) => handleParameterChange('stopLoss', parseFloat(e.target.value))}
                step="1"
                min="0"
              />
            </div>
          </div>

          <div className="config-section">
            <h4>Transaction Settings</h4>
            <div className="input-group">
              <label>Gas (SOL)</label>
              <input
                type="number"
                value={parameters.gas}
                onChange={(e) => handleParameterChange('gas', parseFloat(e.target.value))}
                step="0.001"
                min="0.002"
              />
            </div>
            <div className="input-group">
              <label>Slippage (%)</label>
              <input
                type="number"
                value={parameters.slippage}
                onChange={(e) => handleParameterChange('slippage', parseFloat(e.target.value))}
                step="0.1"
                min="0"
              />
            </div>
            <div className="input-group">
              <label>Anti-MEV Protection</label>
              <input
                type="checkbox"
                checked={parameters.antiMEV}
                onChange={(e) => handleParameterChange('antiMEV', e.target.checked)}
              />
            </div>
          </div>

          <button 
            onClick={handleBuy} 
            className="execute-button"
            disabled={!walletConnected || !targetTokenAddress}
          >
            Execute Trade
          </button>
        </div>
      )}

      <Handle type="source" position="right" />
    </div>
  );
} 