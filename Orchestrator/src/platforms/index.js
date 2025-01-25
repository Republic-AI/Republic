// Base Platform Class
class SocialPlatform {
  constructor(config) {
    this.config = config;
    this.autoPost = config.autoPost || false;
  }

  async post(content) {
    throw new Error('Post method must be implemented');
  }

  async initialize() {
    throw new Error('Initialize method must be implemented');
  }
}

// Twitter Platform Implementation
class TwitterPlatform extends SocialPlatform {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    if (!this.apiKey) {
      throw new Error('Twitter API key is required');
    }
  }

  async initialize() {
    try {
      // Initialize Twitter client
      this.client = new TwitterApi(this.apiKey);
      await this.client.verifyCredentials();
      return true;
    } catch (error) {
      console.error('Twitter initialization failed:', error);
      throw error;
    }
  }

  async post(content) {
    try {
      if (!this.client) {
        await this.initialize();
      }
      const tweet = await this.client.tweet(content);
      return {
        success: true,
        id: tweet.id,
        url: `https://twitter.com/i/status/${tweet.id}`
      };
    } catch (error) {
      console.error('Twitter post failed:', error);
      throw error;
    }
  }
}

// Discord Platform Implementation
class DiscordPlatform extends SocialPlatform {
  constructor(config) {
    super(config);
    this.botToken = config.botToken;
    this.channels = config.channels || [];
    if (!this.botToken) {
      throw new Error('Discord bot token is required');
    }
  }

  async initialize() {
    try {
      // Initialize Discord client
      this.client = new Discord.Client({
        intents: [
          Discord.Intents.FLAGS.GUILDS,
          Discord.Intents.FLAGS.GUILD_MESSAGES
        ]
      });

      await this.client.login(this.botToken);
      return true;
    } catch (error) {
      console.error('Discord initialization failed:', error);
      throw error;
    }
  }

  async post(content) {
    try {
      if (!this.client) {
        await this.initialize();
      }

      const results = [];
      for (const channelId of this.channels) {
        const channel = await this.client.channels.fetch(channelId);
        const message = await channel.send(content);
        results.push({
          success: true,
          channelId,
          messageId: message.id,
          url: message.url
        });
      }
      return results;
    } catch (error) {
      console.error('Discord post failed:', error);
      throw error;
    }
  }
}

// Telegram Platform Implementation
class TelegramPlatform extends SocialPlatform {
  constructor(config) {
    super(config);
    this.botToken = config.botToken;
    this.channels = config.channels || [];
    if (!this.botToken) {
      throw new Error('Telegram bot token is required');
    }
  }

  async initialize() {
    try {
      // Initialize Telegram client
      this.client = new Telegram.Bot(this.botToken, { polling: false });
      const me = await this.client.getMe();
      this.botInfo = me;
      return true;
    } catch (error) {
      console.error('Telegram initialization failed:', error);
      throw error;
    }
  }

  async post(content) {
    try {
      if (!this.client) {
        await this.initialize();
      }

      const results = [];
      for (const channelId of this.channels) {
        const message = await this.client.sendMessage(channelId, content);
        results.push({
          success: true,
          channelId,
          messageId: message.message_id
        });
      }
      return results;
    } catch (error) {
      console.error('Telegram post failed:', error);
      throw error;
    }
  }
}

// Document Store Implementation
class DocumentStore {
  constructor(config = {}) {
    this.config = config;
    this.documents = new Map();
    this.maxDocuments = config.maxDocuments || 100;
    this.storageType = config.storageType || 'local';
  }

  async add(document) {
    if (this.documents.size >= this.maxDocuments) {
      const oldestKey = this.documents.keys().next().value;
      this.documents.delete(oldestKey);
    }

    const docId = crypto.randomUUID();
    this.documents.set(docId, {
      ...document,
      id: docId,
      timestamp: new Date().toISOString()
    });

    return docId;
  }

  async get(docId) {
    return this.documents.get(docId);
  }

  async list() {
    return Array.from(this.documents.values());
  }

  async delete(docId) {
    return this.documents.delete(docId);
  }
}

module.exports = {
  SocialPlatform,
  TwitterPlatform,
  DiscordPlatform,
  TelegramPlatform,
  DocumentStore
}; 