const axios = require('axios');

class SocialPlatform {
  constructor(config = {}) {
    this.config = config;
    this.initialized = false;
    this.axios = axios.create({
      timeout: 10000,
      headers: { 'User-Agent': 'Republic/1.0' }
    });
  }

  async initialize() {
    if (!this.config.token) {
      throw new Error('API token is required');
    }
    this.initialized = true;
    return true;
  }

  async post(content) {
    throw new Error('Post method must be implemented');
  }

  async validateContent(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('Content must be a non-empty string');
    }
    return true;
  }
}

class TwitterPlatform extends SocialPlatform {
  constructor(config) {
    super(config);
    this.apiBase = 'https://api.twitter.com/2';
    this.axios.defaults.headers.common['Authorization'] = `Bearer ${config.token}`;
  }

  async initialize() {
    await super.initialize();
    try {
      const response = await this.axios.get(`${this.apiBase}/users/me`);
      this.userId = response.data.data.id;
      return true;
    } catch (error) {
      throw new Error(`Twitter authentication failed: ${error.message}`);
    }
  }

  async post(content) {
    await this.validateContent(content);
    if (!this.initialized) await this.initialize();

    try {
      const response = await this.axios.post(`${this.apiBase}/tweets`, {
        text: content.slice(0, 280) // Twitter's character limit
      });

      return {
        platform: 'twitter',
        success: true,
        tweetId: response.data.data.id,
        url: `https://twitter.com/i/web/status/${response.data.data.id}`
      };
    } catch (error) {
      console.error('Twitter API error:', error.response?.data || error.message);
      throw new Error(`Failed to post to Twitter: ${error.message}`);
    }
  }
}

class FarcasterPlatform extends SocialPlatform {
  constructor(config) {
    super(config);
    this.apiBase = 'https://api.farcaster.xyz/v1';
    this.axios.defaults.headers.common['Authorization'] = `Bearer ${config.token}`;
  }

  async initialize() {
    await super.initialize();
    try {
      const response = await this.axios.get(`${this.apiBase}/me`);
      this.fid = response.data.fid;
      return true;
    } catch (error) {
      throw new Error(`Farcaster authentication failed: ${error.message}`);
    }
  }

  async post(content) {
    await this.validateContent(content);
    if (!this.initialized) await this.initialize();

    try {
      const response = await this.axios.post(`${this.apiBase}/casts`, {
        text: content.slice(0, 320), // Farcaster's character limit
        parent: null,
        mentions: [],
        embeds: []
      });

      return {
        platform: 'farcaster',
        success: true,
        castHash: response.data.hash,
        url: `https://warpcast.com/${this.username}/${response.data.hash}`
      };
    } catch (error) {
      console.error('Farcaster API error:', error.response?.data || error.message);
      throw new Error(`Failed to post to Farcaster: ${error.message}`);
    }
  }
}

class DiscordPlatform extends SocialPlatform {
  constructor(config) {
    super(config);
    this.apiBase = 'https://discord.com/api/v10';
    this.axios.defaults.headers.common['Authorization'] = `Bot ${config.token}`;
    this.channels = config.channels || [];
  }

  async initialize() {
    await super.initialize();
    try {
      const response = await this.axios.get(`${this.apiBase}/users/@me`);
      this.botId = response.data.id;
      return true;
    } catch (error) {
      throw new Error(`Discord authentication failed: ${error.message}`);
    }
  }

  async post(content, options = {}) {
    await this.validateContent(content);
    if (!this.initialized) await this.initialize();

    const results = [];
    const channels = options.channels || this.channels;

    if (!channels.length) {
      throw new Error('No Discord channels specified');
    }

    for (const channelId of channels) {
      try {
        const response = await this.axios.post(`${this.apiBase}/channels/${channelId}/messages`, {
          content: content,
          embeds: options.embeds || [],
          components: options.components || []
        });

        results.push({
          platform: 'discord',
          success: true,
          channelId: channelId,
          messageId: response.data.id,
          url: `https://discord.com/channels/${response.data.guild_id}/${channelId}/${response.data.id}`
        });
      } catch (error) {
        console.error(`Discord API error for channel ${channelId}:`, error.response?.data || error.message);
        results.push({
          platform: 'discord',
          success: false,
          channelId: channelId,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = {
  TwitterPlatform,
  FarcasterPlatform,
  DiscordPlatform
}; 