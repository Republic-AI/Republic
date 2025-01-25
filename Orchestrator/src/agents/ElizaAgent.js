const { BaseAgent } = require('./BaseAgent');
const { ConversationMemory, EmotionalMemory } = require('../memory');

class ElizaAgent extends BaseAgent {
  constructor(config) {
    super(config);
    
    // Initialize personality from config
    this.personality = {
      name: config.therapistPersonality?.name || 'Eliza',
      role: config.therapistPersonality?.role || 'Psychotherapist',
      style: config.therapistPersonality?.style || 'Rogerian'
    };

    // Initialize response configuration
    this.responseConfig = {
      reflectionLevel: config.responseStyle?.reflectionLevel || 3,
      empathyLevel: config.responseStyle?.empathyLevel || 4
    };

    // Initialize memory based on config
    this.memory = this.initializeMemory(config.memoryConfig);

    // Initialize pattern matching system
    this.patterns = this.initializePatterns();
    
    // Initialize reflection mappings
    this.reflectionMap = this.initializeReflectionMap();
  }

  initializeMemory(config) {
    switch (config?.memoryType) {
      case 'emotional':
        return new EmotionalMemory(config.contextWindow || 5);
      case 'conversation':
      case 'summary':
      default:
        return new ConversationMemory(config.contextWindow || 5);
    }
  }

  initializePatterns() {
    return [
      {
        match: /I am (.*)/i,
        responses: [
          "Why do you say you are {1}?",
          "How long have you been {1}?",
          "Do you believe it is normal to be {1}?"
        ],
        weight: 0.8
      },
      {
        match: /I feel (.*)/i,
        responses: [
          "Tell me more about feeling {1}.",
          "Do you often feel {1}?",
          "What makes you feel {1}?"
        ],
        weight: 0.9
      },
      {
        match: /I want (.*)/i,
        responses: [
          "What would it mean if you got {1}?",
          "Why do you want {1}?",
          "What would happen if you got {1}?"
        ],
        weight: 0.7
      }
      // Add more patterns as needed
    ];
  }

  initializeReflectionMap() {
    return {
      'am': 'are',
      'was': 'were',
      'I': 'you',
      'my': 'your',
      'mine': 'yours',
      'myself': 'yourself'
    };
  }

  async execute(input) {
    try {
      // 1. Load conversation context
      const context = await this.memory.loadMemoryVariables();
      
      // 2. Analyze input for patterns
      const matchedPattern = this.findBestPattern(input);
      
      // 3. Generate base response
      let response;
      if (matchedPattern) {
        response = this.generatePatternResponse(matchedPattern, input);
      } else {
        // Use LLM for non-pattern responses
        const prompt = this.constructPrompt(input, context);
        response = await this.model.call(prompt);
      }

      // 4. Apply reflection based on configuration
      if (this.responseConfig.reflectionLevel > 2) {
        response = this.applyReflection(response);
      }

      // 5. Adjust empathy level
      if (this.responseConfig.empathyLevel > 3) {
        response = await this.enhanceEmpathy(response);
      }

      // 6. Save to memory
      await this.memory.saveContext(
        { input }, 
        { output: response }
      );

      return response;
    } catch (error) {
      console.error('Error in Eliza execution:', error);
      throw error;
    }
  }

  findBestPattern(input) {
    let bestMatch = null;
    let highestWeight = 0;

    for (const pattern of this.patterns) {
      const match = input.match(pattern.match);
      if (match && pattern.weight > highestWeight) {
        bestMatch = { ...pattern, matches: match };
        highestWeight = pattern.weight;
      }
    }

    return bestMatch;
  }

  generatePatternResponse(pattern, input) {
    const responses = pattern.responses;
    const randomIndex = Math.floor(Math.random() * responses.length);
    let response = responses[randomIndex];

    // Replace placeholders with matched groups
    for (let i = 1; i < pattern.matches.length; i++) {
      response = response.replace(`{${i}}`, pattern.matches[i]);
    }

    return response;
  }

  applyReflection(text) {
    return text.split(' ').map(word => {
      return this.reflectionMap[word.toLowerCase()] || word;
    }).join(' ');
  }

  async enhanceEmpathy(response) {
    const prompt = `
Given this therapeutic response: "${response}"
Enhance its empathy while maintaining the same meaning.
Make it more warm and understanding, but keep it professional.
The current empathy level setting is: ${this.responseConfig.empathyLevel}/5
`;

    return await this.model.call(prompt);
  }

  constructPrompt(input, context) {
    return `
You are ${this.personality.name}, a ${this.personality.role} practicing ${this.personality.style} therapy.
Your responses should reflect a therapy session with appropriate depth and empathy.

Conversation History:
${JSON.stringify(context.history)}

Current Input: ${input}

Respond in a way that:
1. Shows understanding of the user's perspective
2. Encourages further exploration
3. Maintains professional boundaries
4. Uses reflection techniques when appropriate
5. Follows ${this.personality.style} therapy principles

Response:`;
  }
}

module.exports = { ElizaAgent }; 