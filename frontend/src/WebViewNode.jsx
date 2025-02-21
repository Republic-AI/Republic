import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';

export default function WebViewNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenCA, setTokenCA] = useState('');

  // Handle input from connected nodes (like Analyst Agent)
  useEffect(() => {
    if (data.inputs && data.inputs.length > 0) {
      // Find input that contains a contract address
      const contractInput = data.inputs.find(input => 
        input.output?.content && 
        /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input.output.content)
      );

      if (contractInput) {
        const newCA = contractInput.output.content;
        setTokenCA(newCA);
        // Construct GMGN K-line URL
        const newUrl = `https://www.gmgn.cc/kline/sol/${newCA}`;
        setUrl(newUrl);
        
        // Update node data
        data.onChange({
          ...data,
          url: newUrl,
          tokenCA: newCA
        });
      }
    }
  }, [data.inputs]);

  const openInNewTab = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className={`custom-node ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle type="target" position="left" />

      <div className="node-header">
        <select className="node-type-select" value="webview" disabled>
          <option value="webview">K Chart</option>
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
          <div className="token-info">
            {tokenCA ? (
              <>
                <h4>Token Address</h4>
                <div className="token-address">
                  {tokenCA.slice(0, 6)}...{tokenCA.slice(-4)}
                </div>
              </>
            ) : (
              <p className="no-token">Connect to a node with token address</p>
            )}
          </div>

          {url && (
            <div className="chart-container">
              <iframe
                src={url}
                title="GMGN K-line Chart"
                className="chart-iframe"
                sandbox="allow-same-origin allow-scripts allow-popups"
                loading="lazy"
              />
              <button 
                onClick={openInNewTab}
                className="open-chart-btn"
              >
                Open in New Tab
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      )}

      <Handle type="source" position="right" />
    </div>
  );
} 