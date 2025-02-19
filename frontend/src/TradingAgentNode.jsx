import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';
import axios from 'axios';

const GMGN_API_BASE = 'https://gmgn.ai/defi/router/v1/sol';

export default function TradingAgentNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
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
    if (!walletConnected || !publicKey) {
      alert('Please connect wallet first');
      return;
    }

    try {
      // Get swap route
      const route = await getSwapRoute(
        'So11111111111111111111111111111111111111112', // SOL
        data.tokenAddress,
        parameters.fixedBuy * 1e9, // Convert to lamports
        publicKey.toBase58()
      );

      // Sign and send the transaction
      const transaction = Transaction.from(Buffer.from(route.data.raw_tx.swapTransaction, 'base64'));
      const signature = await sendTransaction(transaction, new Connection('https://attentive-lingering-general.solana-mainnet.quiknode.pro/b510e1a738a9447f3a963bc61b7f002287b72eb1/')); // Replace with your connection
      console.log('Transaction signature:', signature);

      // Submit transaction (using GMGN)
      const result = await submitTransaction(route.data.raw_tx.swapTransaction, parameters.antiMEV);
      console.log('GMGN Submit Result:', result);

      // Check status (using GMGN)
      const status = await checkTransactionStatus(result.data.hash, route.data.raw_tx.lastValidBlockHeight);
      console.log('Transaction Status:', status);

    } catch (error) {
      console.error('Error executing buy:', error);
      alert('Error executing buy: ' + error.message);
    }
  };

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

          <button onClick={handleBuy} className="execute-button">
            Execute Trade
          </button>
        </div>
      )}

      <Handle type="source" position="right" />
    </div>
  );
} 