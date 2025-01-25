const { BaseAgent } = require('./BaseAgent');
const { BufferMemory } = require('langchain/memory');
const { DocumentStore } = require('../utils/DocumentStore');
const { TwitterPlatform, DiscordPlatform, TelegramPlatform } = require('../platforms');

class ElizaAgent extends BaseAgent {
  constructor(config) {
    super(config);
    // Core agent properties
    this.name = config.therapistName || 'Eliza';
    this.role = config.therapistRole || 'Rogerian';
    this.conversationStyle = config.conversationStyle || 'Empathetic';
    this.reflectionLevel = config.reflectionLevel || 7;
    
    // Social platform integrations
    this.socialPlatforms = this.initializeSocialPlatforms(config.socialPlatforms || {});
    
    // Document store and memory
    this.documentStore = new DocumentStore(config.documentStoreConfig || {});
    this.memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
      outputKey: "output"
    });

    // Pattern matching and response generation
    this.patterns = this.loadPatterns();
    this.responseGenerators = this.initializeResponseGenerators();
    
    // Multi-agent support
    this.collaborators = new Map();
    if (config.collaborators) {
      for (const [id, agentConfig] of Object.entries(config.collaborators)) {
        this.collaborators.set(id, new ElizaAgent(agentConfig));
      }
    }
  }

  initializeSocialPlatforms(config) {
    const platforms = {};
    
    if (config.twitter?.enabled) {
      platforms.twitter = new TwitterPlatform({
        apiKey: config.twitter.apiKey,
        autoPost: config.twitter.autoPost
      });
    }

    if (config.discord?.enabled) {
      platforms.discord = new DiscordPlatform({
        botToken: config.discord.botToken,
        channels: config.discord.channels,
        autoPost: config.discord.autoPost
      });
    }

    if (config.telegram?.enabled) {
      platforms.telegram = new TelegramPlatform({
        botToken: config.telegram.botToken,
        channels: config.telegram.channels,
        autoPost: config.telegram.autoPost
      });
    }

    return platforms;
  }

  loadPatterns() {
    return {
      greeting: [
        { pattern: /hello|hi|hey/i, response: `Hello, I'm ${this.name}. How are you feeling today?` },
        { pattern: /how are you/i, response: "I'm here to listen to you. What's on your mind?" }
      ],
      reflection: [
        { pattern: /i am (.*)/i, response: "How long have you been $1?" },
        { pattern: /i feel (.*)/i, response: "Tell me more about why you feel $1." },
        { pattern: /i think (.*)/i, response: "What makes you think $1?" }
      ],
      deepening: [
        { pattern: /because (.*)/i, response: "Is that the only reason $1?" },
        { pattern: /but (.*)/i, response: "What other aspects of $1 concern you?" }
      ],
      emotions: [
        { pattern: /(sad|angry|happy|anxious|worried)/i, response: "How does being $1 affect your daily life?" },
        { pattern: /afraid|scared/i, response: "What aspects of this situation frighten you the most?" }
      ],
      documents: [
        { pattern: /read|document|file/i, response: "I'll help you analyze that document. What specific aspects interest you?" }
      ]
    };
  }

  async matchPattern(input) {
    for (const category in this.patterns) {
      for (const { pattern, response } of this.patterns[category]) {
        const match = input.match(pattern);
        if (match) {
          const formattedResponse = response.replace(/\$(\d+)/g, (_, n) => match[n] || '');
          return formattedResponse;
        }
      }
    }
    return null;
  }

  initializeResponseGenerators() {
    return {
      reflection: this.generateReflection.bind(this),
      analysis: this.generateAnalysis.bind(this),
      summary: this.generateSummary.bind(this),
      action: this.generateActionPlan.bind(this)
    };
  }

  async generateReflection(input) {
    const reflectionPhrases = [
      "I hear you saying that",
      "It sounds like",
      "You seem to feel that",
      "I understand that",
      "You're expressing that"
    ];
    const phrase = reflectionPhrases[Math.floor(Math.random() * reflectionPhrases.length)];
    return `${phrase} ${input}. Would you like to explore that further?`;
  }

  async generateAnalysis(input, context) {
    const prompt = `
      Analyze the following input in the context of our therapeutic conversation:
      Input: ${input}
      Context: ${context}
      
      Provide a structured analysis focusing on:
      1. Emotional content
      2. Core beliefs
      3. Behavioral patterns
      4. Potential areas for exploration
    `;
    return await this.model.call(prompt);
  }

  async generateSummary(conversation) {
    const prompt = `
      Summarize the key points of our therapeutic conversation:
      ${conversation}
      
      Focus on:
      1. Main themes
      2. Emotional progress
      3. Insights gained
      4. Areas for future exploration
    `;
    return await this.model.call(prompt);
  }

  async generateActionPlan(insights) {
    const prompt = `
      Based on these therapeutic insights:
      ${insights}
      
      Create a gentle, non-prescriptive action plan that:
      1. Encourages self-reflection
      2. Supports emotional awareness
      3. Promotes healthy coping strategies
      4. Maintains therapeutic boundaries
    `;
    return await this.model.call(prompt);
  }

  async processDocument(document) {
    await this.documentStore.add(document);
    const analysis = await this.generateAnalysis(document.content, "document review");
    return {
      analysis,
      metadata: document.metadata
    };
  }

  async broadcastToSocialPlatforms(response) {
    const results = {};
    for (const [platform, client] of Object.entries(this.socialPlatforms)) {
      if (client.autoPost) {
        try {
          results[platform] = await client.post(response);
        } catch (error) {
          console.error(`Error posting to ${platform}:`, error);
          results[platform] = { error: error.message };
        }
      }
    }
    return results;
  }

  async execute(input) {
    try {
      // Load conversation history
      const context = await this.memory.loadMemoryVariables({});
      const history = context.chat_history || [];

      // Try pattern matching first
      let response = await this.matchPattern(input);

      // If no pattern match, use the LLM with proper context
      if (!response) {
        const prompt = `
Role: You are ${this.name}, a ${this.role} therapist with a ${this.conversationStyle} conversation style.
Context: Previous conversation history:
${history.map(h => `${h.type}: ${h.content}`).join('\n')}

Current input: ${input}

Instructions:
1. Maintain a reflection level of ${this.reflectionLevel}/10
2. Use active listening techniques
3. Focus on the client's emotions and experiences
4. Avoid giving direct advice
5. Use open-ended questions
6. Stay within your therapeutic role

Response:`;

        response = await this.model.call(prompt);
      }

      // Generate additional insights
      const analysis = await this.generateAnalysis(input, history);
      
      // Save the interaction to memory
      await this.memory.saveContext(
        { input: input },
        { output: response }
      );

      // Broadcast to social platforms if configured
      const socialResults = await this.broadcastToSocialPlatforms(response);

      // Return comprehensive response
      return {
        content: response,
        metadata: {
          therapistName: this.name,
          role: this.role,
          style: this.conversationStyle,
          timestamp: new Date().toISOString(),
          analysis: analysis,
          socialPlatforms: socialResults
        }
      };
    } catch (error) {
      console.error('Error in Eliza execution:', error);
      throw new Error(`Eliza execution failed: ${error.message}`);
    }
  }
}

module.exports = { ElizaAgent }; 