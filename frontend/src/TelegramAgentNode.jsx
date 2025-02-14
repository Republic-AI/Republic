import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';
import { ElizaBot } from './utils/eliza';

export default function TelegramAgentNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [apiConfig, setApiConfig] = useState({
    botToken: data.botToken || ''
  });
  const [messageConfig, setMessageConfig] = useState({
    elizaPrompt: '',
    customRules: '',
    targetChats: [],  // Store chat IDs
    newChat: '',
  });
  const [elizaBot, setElizaBot] = useState(null);

    useEffect(() => {
        const messageRules = parseRules(messageConfig.customRules);
        setElizaBot(new ElizaBot(messageRules));
    }, [messageConfig.customRules]);

    const parseRules = (rulesText) => {
        try {
            return JSON.parse(rulesText);
        } catch {
            return {};
        }
    };

  const handleApiConfigChange = (value) => {
    setApiConfig({ botToken: value });
    data.onChange({
      ...data,
      botToken: value
    });
  };

  const handleMessageConfigChange = (key, value) => {
    const updatedConfig = {
      ...messageConfig,
      [key]: value
    };
    setMessageConfig(updatedConfig);
    data.onChange({
      ...data,
      messageConfig: updatedConfig
    });
  };

  const handleAddChat = () => {
    if (messageConfig.newChat && !messageConfig.targetChats.includes(messageConfig.newChat)) {
      const updatedChats = [...messageConfig.targetChats, messageConfig.newChat];
      handleMessageConfigChange('targetChats', updatedChats);
      handleMessageConfigChange('newChat', '');
    }
  };

    const handleRemoveChat = (chat) => {
        const updatedChats = messageConfig.targetChats.filter((c) => c !== chat);
        handleMessageConfigChange("targetChats", updatedChats);
    };

  const handleSendMessage = async (chatId) => {
    if (!elizaBot || !apiConfig.botToken) return;

    try {
      const message = elizaBot.generateTweet(messageConfig.elizaPrompt); // Use generateTweet-like logic

      const response = await fetch('http://localhost:5002/send-telegram-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botToken: apiConfig.botToken,
          chatId: chatId,
          message
        })
      });

      const result = await response.json();
      console.log('Sent message:', result);
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Error sending Telegram message: ${error.message}`);
    }
  };
    
    const handleReceiveMessage = async () => {
        if (!apiConfig.botToken) return;
        
        try {
            const response = await fetch("http://localhost:5002/receive-telegram-message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    botToken: apiConfig.botToken,
                }),
            });
            
            const result = await response.json();
            console.log("Received message:", result);
        } catch (error) {
            console.error("Error receiving message:", error);
            alert(`Error receiving Telegram message: ${error.message}`);
        }
    };

  return (
    <div className={`custom-node ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle type="target" position="left" />

      <div className="node-header">
        <select className="node-type-select" value="telegramAgent" disabled>
          <option value="telegramAgent">Telegram Agent</option>
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
            {/* Telegram API Configuration */}
            <div className="api-config-section">
              <h4>Telegram API Configuration</h4>
              <div className="config-field">
                <input
                  type="password"
                  value={apiConfig.botToken}
                  onChange={(e) => handleApiConfigChange(e.target.value)}
                  placeholder="Enter Telegram Bot Token"
                  className="node-input"
                />
              </div>
            </div>

            {/* Message Configuration */}
            <div className="subagent-config">
              <h4>Message Configuration</h4>
              <div className="config-field">
                <label>Target Chats</label>
                <div className="account-input-container">
                  <input
                    type="text"
                    value={messageConfig.newChat}
                    onChange={(e) => handleMessageConfigChange('newChat', e.target.value)}
                    placeholder="Enter Chat ID"
                    className="node-input"
                  />
                  <button
                    onClick={handleAddChat}
                    className="add-account-btn"
                  >
                    Add
                  </button>
                </div>
                <ul className="account-list">
                  {messageConfig.targetChats.map((chat, index) => (
                    <li key={index} className="account-item">
                      {chat}
                      <button onClick={() => handleRemoveChat(chat)} className="remove-account-btn">
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="config-field">
                <label>Eliza Prompt</label>
                <textarea
                  value={messageConfig.elizaPrompt}
                  onChange={(e) => handleMessageConfigChange('elizaPrompt', e.target.value)}
                  placeholder="Enter Eliza prompt for message generation..."
                  className="node-textarea"
                />
              </div>
              <div className="config-field">
                <label>Custom Rules</label>
                <textarea
                  value={messageConfig.customRules}
                  onChange={(e) => handleMessageConfigChange('customRules', e.target.value)}
                  placeholder="Enter custom rules for Eliza..."
                  className="node-textarea"
                />
              </div>
              <div className="config-field">
                <button
                  onClick={() => messageConfig.targetChats.forEach(handleSendMessage)}
                  className="test-button"
                >
                  Test Send
                </button>
                <button onClick={handleReceiveMessage} className="test-button">
                    Test Receive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Handle type="source" position="right" />
    </div>
  );
} 