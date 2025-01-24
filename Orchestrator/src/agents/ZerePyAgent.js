const BaseAgent = require('../core/BaseAgent');

class ZerePyAgent extends BaseAgent {
  constructor(config) {
    super(config);
    
    // Core agent configuration
    this.name = config.agentName;
    this.bio = Array.isArray(config.agentBio) ? config.agentBio : [config.agentBio];
    this.traits = config.traits || ['engaging', 'analytical'];
    this.examples = config.examples || [];
    this.exampleAccounts = config.example_accounts || [];
    this.loopDelay = config.loop_delay || 900;

    // Task weights configuration
    this.tasks = config.tasks || [
      { name: 'post-tweet', weight: 1 },
      { name: 'reply-to-tweet', weight: 1 },
      { name: 'like-tweet', weight: 1 }
    ];
    
    this.useTimeBasedWeights = config.use_time_based_weights || false;
    this.timeBasedMultipliers = config.time_based_multipliers || {
      tweet_night_multiplier: 0.4,
      engagement_day_multiplier: 1.5
    };

    // Platform configurations
    this.platformConfigs = {};
    if (config.config) {
      config.config.forEach(platformConfig => {
        this.platformConfigs[platformConfig.name] = this.initializePlatform(platformConfig);
      });
    }
  }

  initializePlatform(config) {
    switch (config.name) {
      case 'twitter':
        return {
          timelineReadCount: config.timeline_read_count || 10,
          ownTweetRepliesCount: config.own_tweet_replies_count || 2,
          tweetInterval: config.tweet_interval || 5400
        };
      
      case 'farcaster':
        return {
          timelineReadCount: config.timeline_read_count || 10,
          castInterval: config.cast_interval || 60
        };
      
      case 'discord':
        return {
          messageReadCount: config.message_read_count || 10,
          messageEmojiName: config.message_emoji_name || '❤️',
          serverId: config.server_id
        };

      case 'solana':
        return {
          rpc: config.rpc || 'https://api.mainnet-beta.solana.com'
        };

      case 'ethereum':
        return {
          rpc: config.rpc || 'https://eth.blockrazor.xyz'
        };

      case 'sonic':
        return {
          network: config.network || 'mainnet'
        };

      case 'allora':
        return {
          chainSlug: config.chain_slug || 'testnet'
        };

      // LLM configurations
      case 'openai':
      case 'anthropic':
      case 'eternalai':
      case 'ollama':
      case 'hyperbolic':
      case 'galadriel':
        return {
          model: config.model,
          ...config
        };

      default:
        return config;
    }
  }

  async selectTask() {
    if (this.useTimeBasedWeights) {
      const hour = new Date().getHours();
      const isNightTime = hour < 6 || hour > 22;
      const isDayTime = hour > 9 && hour < 18;

      // Apply time-based multipliers
      const adjustedTasks = this.tasks.map(task => ({
        ...task,
        weight: task.weight * (
          isNightTime ? (task.name.startsWith('tweet') ? this.timeBasedMultipliers.tweet_night_multiplier : 1) :
          isDayTime ? (task.name.includes('reply') || task.name.includes('like') ? this.timeBasedMultipliers.engagement_day_multiplier : 1) :
          1
        )
      }));

      return this.weightedRandomSelect(adjustedTasks);
    }

    return this.weightedRandomSelect(this.tasks);
  }

  weightedRandomSelect(tasks) {
    const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const task of tasks) {
      random -= task.weight;
      if (random <= 0) {
        return task.name;
      }
    }
    
    return tasks[0].name;
  }

  async execute(input) {
    try {
      // Load context from memory
      const context = await this.memory.loadMemoryVariables();
      
      // Select task if no specific input
      const task = input || await this.selectTask();
      
      // Prepare prompt with agent context
      const prompt = `
System: You are ${this.name}, an AI agent with the following traits: ${this.traits.join(', ')}.
Bio: ${this.bio.join('\n')}

Task: ${task}
Previous Context: ${JSON.stringify(context.history)}

Examples of good outputs:
${this.examples.join('\n')}

Generate a response that:
1. Matches your personality traits
2. Is contextually relevant
3. Follows the example format
4. Is engaging and natural

Input: ${input || 'Generate content based on the selected task.'}
`;

      // Execute with full context
      const result = await this.model.call(prompt);
      
      // Store in memory
      await this.memory.saveContext(
        { input: task },
        { output: result }
      );

      // Handle social platform posting if configured
      if (this.platformConfigs.twitter || this.platformConfigs.farcaster || this.platformConfigs.discord) {
        const socialResults = await this.handleSocialPosts(result);
        return {
          content: result,
          socialResults,
          task
        };
      }

      return {
        content: result,
        task
      };

    } catch (error) {
      console.error('Error executing ZerePy agent:', error);
      throw error;
    }
  }

  async handleSocialPosts(content) {
    const results = [];

    // Twitter posting
    if (this.platformConfigs.twitter) {
      try {
        const twitterResult = await this.postToTwitter(content);
        results.push({ platform: 'twitter', ...twitterResult });
      } catch (error) {
        results.push({ platform: 'twitter', error: error.message });
      }
    }

    // Farcaster posting
    if (this.platformConfigs.farcaster) {
      try {
        const farcasterResult = await this.postToFarcaster(content);
        results.push({ platform: 'farcaster', ...farcasterResult });
      } catch (error) {
        results.push({ platform: 'farcaster', error: error.message });
      }
    }

    // Discord posting
    if (this.platformConfigs.discord) {
      try {
        const discordResult = await this.postToDiscord(content);
        results.push({ platform: 'discord', ...discordResult });
      } catch (error) {
        results.push({ platform: 'discord', error: error.message });
      }
    }

    return results;
  }

  async postToTwitter(content) {
    // Implementation would use Twitter API client
    return { status: 'success', message: 'Posted to Twitter' };
  }

  async postToFarcaster(content) {
    // Implementation would use Farcaster API client
    return { status: 'success', message: 'Posted to Farcaster' };
  }

  async postToDiscord(content) {
    // Implementation would use Discord API client
    return { status: 'success', message: 'Posted to Discord' };
  }
}

// Handler function for ZerePy agent
const executeZerePyAgent = async (input, config) => {
  const agent = new ZerePyAgent(config);
  const result = await agent.execute(input);
  return result;
};

module.exports = {
  ZerePyAgent,
  executeZerePyAgent
}; 