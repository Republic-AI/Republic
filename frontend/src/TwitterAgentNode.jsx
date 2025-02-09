import React, { useState } from 'react';
import { Handle } from 'reactflow';

export default function TwitterAgentNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [activeSubAgent, setActiveSubAgent] = useState('pull'); // 'pull', 'post', 'reply'
  const [apiConfig, setApiConfig] = useState({
    bearerToken: data.bearerToken || ''
  });
  const [pullConfig, setPullConfig] = useState({
    prompt: '',
    realTime: false,
    timeLength: '24', // hours
    targetAccounts: [],
    newAccount: '',
    checkCA: false,
    checkCoin: false
  });
  const [postConfig, setPostConfig] = useState({
    elizaPrompt: '',
    customRules: '',
    targetAccounts: [],
    newAccount: ''
  });
  const [replyConfig, setReplyConfig] = useState({
    elizaPrompt: '',
    customRules: '',
    targetAccounts: [],
    newAccount: ''
  });

  const handleApiConfigChange = (value) => {
    setApiConfig({ bearerToken: value });
    data.onChange({
      ...data,
      bearerToken: value
    });
  };

  const handlePullConfigChange = (key, value) => {
    const updatedConfig = {
      ...pullConfig,
      [key]: value
    };
    setPullConfig(updatedConfig);
    data.onChange({
      ...data,
      pullConfig: updatedConfig
    });
  };

  const handlePostConfigChange = (key, value) => {
    const updatedConfig = {
      ...postConfig,
      [key]: value
    };
    setPostConfig(updatedConfig);
    data.onChange({
      ...data,
      postConfig: updatedConfig
    });
  };

  const handleReplyConfigChange = (key, value) => {
    const updatedConfig = {
      ...replyConfig,
      [key]: value
    };
    setReplyConfig(updatedConfig);
    data.onChange({
      ...data,
      replyConfig: updatedConfig
    });
  };

  const handleAddAccount = () => {
    if (pullConfig.newAccount && !pullConfig.targetAccounts.includes(pullConfig.newAccount)) {
      const updatedAccounts = [...pullConfig.targetAccounts, pullConfig.newAccount];
      handlePullConfigChange('targetAccounts', updatedAccounts);
      handlePullConfigChange('newAccount', '');
    }
  };

  const handleRemoveAccount = (account) => {
    const updatedAccounts = pullConfig.targetAccounts.filter(a => a !== account);
    handlePullConfigChange('targetAccounts', updatedAccounts);
  };

  const handleAddPostAccount = () => {
    if (postConfig.newAccount && !postConfig.targetAccounts.includes(postConfig.newAccount)) {
      const updatedAccounts = [...postConfig.targetAccounts, postConfig.newAccount];
      handlePostConfigChange('targetAccounts', updatedAccounts);
      handlePostConfigChange('newAccount', '');
    }
  };

  const handleAddReplyAccount = () => {
    if (replyConfig.newAccount && !replyConfig.targetAccounts.includes(replyConfig.newAccount)) {
      const updatedAccounts = [...replyConfig.targetAccounts, replyConfig.newAccount];
      handleReplyConfigChange('targetAccounts', updatedAccounts);
      handleReplyConfigChange('newAccount', '');
    }
  };

  return (
    <div className={`custom-node ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle type="target" position="left" />
      
      <div className="node-header">
        <select className="node-type-select" value="twitterAgent" disabled>
          <option value="twitterAgent">Twitter Agent</option>
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
            {/* Global Twitter API Configuration */}
            <div className="api-config-section">
              <h4>Twitter API Configuration</h4>
              <div className="config-field">
                <input
                  type="password"
                  value={apiConfig.bearerToken}
                  onChange={(e) => handleApiConfigChange(e.target.value)}
                  placeholder="Enter Twitter API Bearer Token"
                  className="node-input"
                />
              </div>
            </div>

            <div className="subagent-tabs">
              <button 
                className={`tab-button ${activeSubAgent === 'pull' ? 'active' : ''}`}
                onClick={() => setActiveSubAgent('pull')}
              >
                Pull Tweet
              </button>
              <button 
                className={`tab-button ${activeSubAgent === 'post' ? 'active' : ''}`}
                onClick={() => setActiveSubAgent('post')}
              >
                Post Tweet
              </button>
              <button 
                className={`tab-button ${activeSubAgent === 'reply' ? 'active' : ''}`}
                onClick={() => setActiveSubAgent('reply')}
              >
                Reply Tweet
              </button>
            </div>

            {/* Pull Tweet Configuration */}
            {activeSubAgent === 'pull' && (
              <div className="subagent-config">
                <h4>Pull Tweet</h4>
                <div className="config-field">
                  <label>Target Twitter Accounts</label>
                  <div className="account-input-container">
                    <input
                      type="text"
                      value={pullConfig.newAccount}
                      onChange={(e) => handlePullConfigChange('newAccount', e.target.value)}
                      placeholder="Enter Twitter handle (without @)"
                      className="node-input"
                    />
                    <button 
                      onClick={handleAddAccount}
                      className="add-account-btn"
                    >
                      Add
                    </button>
                  </div>
                  
                  <ul className="account-list">
                    {pullConfig.targetAccounts.map((account, index) => (
                      <li key={index} className="account-item">
                        @{account}
                        <button
                          onClick={() => handleRemoveAccount(account)}
                          className="remove-account-btn"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="config-field">
                  <label>Prompt</label>
                  <textarea
                    value={pullConfig.prompt}
                    onChange={(e) => handlePullConfigChange('prompt', e.target.value)}
                    placeholder="Enter search prompt..."
                    className="node-textarea"
                  />
                </div>
                <div className="config-field checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={pullConfig.checkCA}
                      onChange={(e) => handlePullConfigChange('checkCA', e.target.checked)}
                    />
                    Check CA (Contract Address)
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={pullConfig.checkCoin}
                      onChange={(e) => handlePullConfigChange('checkCoin', e.target.checked)}
                    />
                    Check $Coin
                  </label>
                </div>
                <div className="config-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={pullConfig.realTime}
                      onChange={(e) => handlePullConfigChange('realTime', e.target.checked)}
                    />
                    Real-time Check
                  </label>
                </div>
                <div className="config-field">
                  <label>Time Length (hours)</label>
                  <select
                    value={pullConfig.timeLength}
                    onChange={(e) => handlePullConfigChange('timeLength', e.target.value)}
                    className="node-select"
                  >
                    <option value="1">1 hour</option>
                    <option value="12">12 hours</option>
                    <option value="24">24 hours</option>
                    <option value="48">48 hours</option>
                  </select>
                </div>
              </div>
            )}

            {/* Post Tweet Configuration */}
            {activeSubAgent === 'post' && (
              <div className="subagent-config">
                <h4>Post Tweet</h4>
                <div className="config-field">
                  <label>Target Twitter Accounts</label>
                  <div className="account-input-container">
                    <input
                      type="text"
                      value={postConfig.newAccount}
                      onChange={(e) => handlePostConfigChange('newAccount', e.target.value)}
                      placeholder="Enter Twitter handle (without @)"
                      className="node-input"
                    />
                    <button 
                      onClick={handleAddPostAccount}
                      className="add-account-btn"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="account-list">
                    {postConfig.targetAccounts.map((account, index) => (
                      <li key={index} className="account-item">
                        @{account}
                        <button
                          onClick={() => handlePostConfigChange('targetAccounts', 
                            postConfig.targetAccounts.filter(a => a !== account))}
                          className="remove-account-btn"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="config-field">
                  <label>Eliza Prompt</label>
                  <textarea
                    value={postConfig.elizaPrompt}
                    onChange={(e) => handlePostConfigChange('elizaPrompt', e.target.value)}
                    placeholder="Enter Eliza prompt for tweet generation..."
                    className="node-textarea"
                  />
                </div>
                <div className="config-field">
                  <label>Custom Rules</label>
                  <textarea
                    value={postConfig.customRules}
                    onChange={(e) => handlePostConfigChange('customRules', e.target.value)}
                    placeholder="Enter custom rules for Eliza..."
                    className="node-textarea"
                  />
                </div>
              </div>
            )}

            {/* Reply Tweet Configuration */}
            {activeSubAgent === 'reply' && (
              <div className="subagent-config">
                <h4>Reply Tweet</h4>
                <div className="config-field">
                  <label>Target Twitter Accounts</label>
                  <div className="account-input-container">
                    <input
                      type="text"
                      value={replyConfig.newAccount}
                      onChange={(e) => handleReplyConfigChange('newAccount', e.target.value)}
                      placeholder="Enter Twitter handle (without @)"
                      className="node-input"
                    />
                    <button 
                      onClick={handleAddReplyAccount}
                      className="add-account-btn"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="account-list">
                    {replyConfig.targetAccounts.map((account, index) => (
                      <li key={index} className="account-item">
                        @{account}
                        <button
                          onClick={() => handleReplyConfigChange('targetAccounts', 
                            replyConfig.targetAccounts.filter(a => a !== account))}
                          className="remove-account-btn"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="config-field">
                  <label>Eliza Prompt</label>
                  <textarea
                    value={replyConfig.elizaPrompt}
                    onChange={(e) => handleReplyConfigChange('elizaPrompt', e.target.value)}
                    placeholder="Enter Eliza prompt for reply generation..."
                    className="node-textarea"
                  />
                </div>
                <div className="config-field">
                  <label>Custom Rules</label>
                  <textarea
                    value={replyConfig.customRules}
                    onChange={(e) => handleReplyConfigChange('customRules', e.target.value)}
                    placeholder="Enter custom rules for Eliza..."
                    className="node-textarea"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Handle type="source" position="right" />
    </div>
  );
} 