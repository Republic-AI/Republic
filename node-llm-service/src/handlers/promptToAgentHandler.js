const { Configuration, OpenAIApi } = require('openai');
const { AnthropicClient } = require('@anthropic-ai/sdk');

async function promptToAgentHandler(node) {
  try {
    const { prompt, apiKey, model } = node.data;
    
    if (!prompt) {
      return { error: "No prompt provided" };
    }
    
    if (!apiKey) {
      return { error: "No API key provided" };
    }
    
    let flowDescription;
    
    // Use OpenAI or Anthropic based on the model selected
    if (model.startsWith('gpt')) {
      // Use OpenAI
      const configuration = new Configuration({
        apiKey: apiKey,
      });
      const openai = new OpenAIApi(configuration);
      
      const response = await openai.createChatCompletion({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are an expert AI system designer that helps users create multi-agent systems from natural language descriptions.
            
Your task is to analyze the user's prompt and generate a complete description of a multi-agent flow using the available node types in our system:
- twitterAgent: Can monitor Twitter for specific accounts or keywords and post tweets
- discordAgent: Can monitor and post to Discord channels
- telegramAgent: Can monitor and post to Telegram groups
- analystAgent: Can analyze tokens, sentiment, and other data
- twitterKOL: Can specify Twitter accounts to follow
- smartMoneyFollower: Can track wallet addresses
- webview: Can display charts and data visualizations
- tradingAgent: Can execute trades based on signals

Return a JSON object with the following structure:
{
  "title": "Name of the multi-agent system",
  "description": "Brief description of what the system does",
  "nodes": [
    {
      "type": "nodeType", // One of the available node types
      "position": {"x": number, "y": number}, // Position on the canvas
      "config": { // Node-specific configuration
        // Configuration options depend on the node type
      }
    }
  ],
  "edges": [
    {
      "source": "node-1", // Source node ID (will be "node-1", "node-2", etc.)
      "target": "node-2"  // Target node ID
    }
  ]
}

Be specific and detailed about the configuration of each node based on the user's requirements. Position the nodes in a logical flow from left to right.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });
      
      flowDescription = JSON.parse(response.data.choices[0].message.content);
    } else if (model.startsWith('claude')) {
      // Use Anthropic
      const anthropic = new AnthropicClient({
        apiKey: apiKey,
      });
      
      const response = await anthropic.messages.create({
        model: model,
        messages: [
          {
            role: "user",
            content: `You are an expert AI system designer that helps users create multi-agent systems from natural language descriptions.
            
Your task is to analyze the following prompt and generate a complete description of a multi-agent flow using the available node types in our system:
- twitterAgent: Can monitor Twitter for specific accounts or keywords and post tweets
- discordAgent: Can monitor and post to Discord channels
- telegramAgent: Can monitor and post to Telegram groups
- analystAgent: Can analyze tokens, sentiment, and other data
- twitterKOL: Can specify Twitter accounts to follow
- smartMoneyFollower: Can track wallet addresses
- webview: Can display charts and data visualizations
- tradingAgent: Can execute trades based on signals

Return a JSON object with the following structure:
{
  "title": "Name of the multi-agent system",
  "description": "Brief description of what the system does",
  "nodes": [
    {
      "type": "nodeType", // One of the available node types
      "position": {"x": number, "y": number}, // Position on the canvas
      "config": { // Node-specific configuration
        // Configuration options depend on the node type
      }
    }
  ],
  "edges": [
    {
      "source": "node-1", // Source node ID (will be "node-1", "node-2", etc.)
      "target": "node-2"  // Target node ID
    }
  ]
}

Be specific and detailed about the configuration of each node based on the user's requirements. Position the nodes in a logical flow from left to right.

Prompt: ${prompt}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });
      
      flowDescription = JSON.parse(response.messages[0].content);
    } else {
      return { error: "Unsupported model selected" };
    }
    
    return {
      flow: flowDescription,
      message: "Multi-agent system design generated successfully"
    };
    
  } catch (error) {
    console.error('Error in promptToAgentHandler:', error);
    return { error: error.message || "An error occurred while processing your request" };
  }
}

module.exports = promptToAgentHandler; 