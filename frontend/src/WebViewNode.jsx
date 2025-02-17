import React, { useState } from 'react';
import { Handle } from 'reactflow';

export default function WebViewNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [url, setUrl] = useState(data.url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useProxy, setUseProxy] = useState(false);

  const handleUrlChange = (event) => {
    const newUrl = event.target.value;
    setUrl(newUrl);
    data.onChange({
      ...data,
      url: newUrl
    });
  };

  const handleLoad = () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(formattedUrl); // Validate URL format
      setUrl(formattedUrl);
      setIsLoading(false);
    } catch (err) {
      setError('Invalid URL format');
      setIsLoading(false);
    }
  };

  const getProxyUrl = (originalUrl) => {
    if (!useProxy) return originalUrl;
    // Use a proxy service to bypass X-Frame-Options
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`;
  };

  const openInNewTab = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className={`custom-node ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle type="target" position="left" />

      <div className="node-header">
        <select className="node-type-select" value="webView" disabled>
          <option value="webView">Web View</option>
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
          {data.inputs?.length > 0 && data.inputs[0]?.output && (
            <div className="twitter-output">
              <h4>Twitter Analysis Results</h4>
              {data.inputs[0].output.summary && (
                <div className="summary-section">
                  <h5>Summary</h5>
                  <p>{data.inputs[0].output.summary}</p>
                </div>
              )}
              {data.inputs[0].output.aiAnalysis && (
                <div className="ai-analysis-section">
                  <h5>AI Analysis</h5>
                  <p>{data.inputs[0].output.aiAnalysis}</p>
                </div>
              )}
              {data.inputs[0].output.content && (
                <div className="content-section">
                  <h5>Raw Data</h5>
                  <pre className="content-pre">
                    {data.inputs[0].output.content}
                  </pre>
                </div>
              )}
            </div>
          )}
          <div className="url-input-section">
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="Enter website URL"
              className="node-input url-input"
            />
            <button 
              onClick={handleLoad}
              className="load-url-button"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load'}
            </button>
          </div>

          <div className="webview-options">
            <label className="proxy-option">
              <input
                type="checkbox"
                checked={useProxy}
                onChange={(e) => setUseProxy(e.target.checked)}
              />
              Use Proxy (for restricted sites)
            </label>
            {url && (
              <button 
                onClick={openInNewTab}
                className="open-new-tab-button"
              >
                Open in New Tab
              </button>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {url && !error && (
            <div className="webview-container">
              <iframe
                src={getProxyUrl(url)}
                title="Web View"
                className="webview-iframe"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                loading="lazy"
                onError={(e) => {
                  setError('Failed to load website. Try using proxy or opening in new tab.');
                }}
              />
            </div>
          )}
        </div>
      )}

      <Handle type="source" position="right" />
    </div>
  );
} 