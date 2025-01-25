const { BaseAgent } = require('./BaseAgent');
const { ConversationMemory, EmotionalMemory } = require('./memory');
const { PatternMatcher } = require('./patterns');

class ElizaAgent extends BaseAgent {
  constructor(config = {}) {
    super(config);
    
    // Initialize personality
    this.personality = {
      name: config.name || 'Eliza',
      role: config.role || 'therapist',
      style: config.style || 'empathetic'
    };

    // Initialize response style
    this.responseStyle = {
      reflectionLevel: config.reflectionLevel || 0.7,
      empathyLevel: config.empathyLevel || 0.8
    };

    // Initialize components
    this.initializeMemory(config);
    this.patternMatcher = new PatternMatcher();
  }

  initializeMemory(config) {
    const memoryType = config.memoryType || 'emotional';
    const windowSize = config.contextWindow || 5;

    if (memoryType === 'emotional') {
      this.memory = new EmotionalMemory(windowSize);
    } else {
      this.memory = new ConversationMemory(windowSize);
    }
  }

  async execute(input) {
    try {
      // Load conversation history
      const history = await this.memory.loadMemoryVariables();
      
      // Generate response based on input and history
      const response = await this.generateResponse(input, history);
      
      // Save context
      await this.memory.saveContext(
        { input },
        { output: response }
      );

      return {
        content: response.content,
        metadata: {
          type: response.type,
          emotionalState: this.memory.getEmotionalSummary?.() || null,
          personality: this.personality
        }
      };

    } catch (error) {
      console.error('Error in ElizaAgent execution:', error);
      throw error;
    }
  }

  async generateResponse(input, history) {
    // Get pattern-based response
    const patternResponse = this.patternMatcher.getResponse(
      input,
      this.responseStyle
    );

    // Format final response
    const content = this.formatResponse(patternResponse);
    
    return {
      content,
      type: patternResponse.type
    };
  }

  formatResponse(response) {
    // Add personality-specific prefixes based on role and style
    const prefixes = {
      therapist: ['I see.', 'Hmm.', 'Let\'s explore that.'],
      counselor: ['From what you\'re saying,', 'It sounds like,', 'I\'m hearing that,'],
      friend: ['You know,', 'I feel that,', 'Maybe,']
    };

    const rolePrefix = prefixes[this.personality.role] || prefixes.therapist;
    const prefix = Math.random() < 0.3 ? 
      rolePrefix[Math.floor(Math.random() * rolePrefix.length)] + ' ' :
      '';

    return prefix + response.response;
  }

  async cleanup() {
    if (this.memory) {
      await this.memory.clear();
    }
  }
}

module.exports = {
  ElizaAgent
}; 