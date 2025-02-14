import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';

export default function WalletNode({ data }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkConnection();

    if (window.okxwallet) {
      window.okxwallet.on('accountsChanged', handleAccountsChanged);
      window.okxwallet.on('chainChanged', handleChainChanged);
      window.okxwallet.on('disconnect', handleDisconnect);
    }

    return () => {
      if (window.okxwallet) {
        window.okxwallet.removeListener('accountsChanged', handleAccountsChanged);
        window.okxwallet.removeListener('chainChanged', handleChainChanged);
        window.okxwallet.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window.okxwallet !== 'undefined') {
      try {
        const accounts = await window.okxwallet.request({
          method: 'eth_accounts'
        });
        if (accounts.length > 0) {
          handleAccountsChanged(accounts);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectOKXWallet = async () => {
    setIsLoading(true);
    try {
      if (typeof window.okxwallet === 'undefined') {
        window.open('https://www.okx.com/web3', '_blank');
        alert('Please install OKX Wallet extension first');
        return;
      }

      // This will trigger the OKX Wallet popup
      const accounts = await window.okxwallet.request({
        method: 'eth_requestAccounts'
      });

      handleAccountsChanged(accounts);

    } catch (error) {
      console.error('Error connecting to OKX wallet:', error);
      if (error.code === 4001) {
        alert('Please accept the connection request in your OKX wallet');
      } else {
        alert('Failed to connect to OKX wallet. Please make sure it is unlocked.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setWalletAddress(accounts[0]);
      setIsConnected(true);
      updateNodeData(accounts[0], true);
    } else {
      handleDisconnect();
    }
  };

  const handleChainChanged = (chainId) => {
    console.log('Chain changed:', chainId);
  };

  const handleDisconnect = () => {
    setWalletAddress('');
    setIsConnected(false);
    updateNodeData('', false);
  };

  const updateNodeData = (address, connected) => {
    data.onChange({
      ...data,
      walletAddress: address,
      isConnected: connected
    });
  };

  const disconnectWallet = async () => {
    try {
      if (window.okxwallet) {
        // Just clear the local state as OKX Wallet doesn't have a disconnect method
        handleDisconnect();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <div className="wallet-node">
      <div className="wallet-node-header">
        <div className="wallet-title">OKX Wallet</div>
        <button
          className="config-toggle"
          onClick={() => setIsConfigOpen(!isConfigOpen)}
        >
          {isConfigOpen ? '▼' : '▶'}
        </button>
      </div>

      {isConfigOpen && (
        <div className="wallet-content">
          {!isConnected ? (
            <button
              onClick={connectOKXWallet}
              className="connect-wallet-button"
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect OKX Wallet'}
            </button>
          ) : (
            <div className="wallet-info">
              <div className="wallet-address">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
              <button
                onClick={disconnectWallet}
                className="disconnect-wallet-button"
                disabled={isLoading}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      )}

      <Handle type="source" position="right" />
    </div>
  );
} 