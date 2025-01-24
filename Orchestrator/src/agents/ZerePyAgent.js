const BaseAgent = require('../core/BaseAgent');
const { TwitterPlatform, FarcasterPlatform, DiscordPlatform } = require('../platforms');

class ZerePyAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.name = config.agentName || 'ZerePy';
    this.bio = config.agentBio || 'Social media management agent';
    this.traits = config.traits || ['engaging', 'analytical'];
    this.taskWeights = config.taskWeights || {
      contentCreation: 0.4,
      engagement: 0.3,
      analysis: 0.3
    };
  }

  async execute(input) {
    const context = await this.memory.loadMemoryVariables();
    
    // Generate content
    const prompt = `
System: You are ${this.name}, a social media management AI with the following traits: ${this.traits.join(', ')}.
Bio: ${this.bio}
Task: Create engaging social media content based on the following input.

Context: ${JSON.stringify(context.history)}
Input: ${input}

Generate a response that maintains a consistent message while being engaging and concise.
`;

    const result = await this.model.call(prompt);
    await this.memory.saveContext({ input }, { output: result });
    return result;
  }
}

// Handler function for ZerePy agent
const executeZerePyAgent = async (input, config) => {
  try {
    // Initialize platform instances
    const socialPlatforms = {
      twitter: config.apiKeys?.twitter ? new TwitterPlatform({ token: config.apiKeys.twitter }) : null,
      farcaster: config.apiKeys?.farcaster ? new FarcasterPlatform({ token: config.apiKeys.farcaster }) : null,
      discord: config.apiKeys?.discord ? new DiscordPlatform({ token: config.apiKeys.discord }) : null,
    };

    // Create the agent instance
    const agent = new ZerePyAgent(config);
    
    // Process input through the agent
    const agentResult = await agent.execute(input);
    
    // Format the result
    let result = {
      content: agentResult,
      socialPosts: []
    };

    // Post to social platforms if configured
    if (config.socialPlatforms) {
      for (const platform of config.socialPlatforms) {
        const client = socialPlatforms[platform];
        if (client) {
          try {
            const postResult = await client.post(agentResult);
            result.socialPosts.push({
              platform,
              success: true,
              ...postResult
            });
          } catch (error) {
            console.error(`Error posting to ${platform}:`, error);
            result.socialPosts.push({
              platform,
              success: false,
              error: error.message
            });
          }
        }
      }
    }

    // Return only the content for consistent handling
    return result.content;
  } catch (error) {
    console.error('Error executing ZerePy agent:', error);
    return `Error: ${error.message}`;
  }
};

module.exports = {
  ZerePyAgent,
  executeZerePyAgent
}; 