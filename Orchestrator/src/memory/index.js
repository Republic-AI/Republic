const { BufferMemory } = require('langchain/memory');

class ConversationMemory {
  constructor(windowSize = 5) {
    this.memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "history",
      inputKey: "input",
      outputKey: "output",
      k: windowSize
    });
  }

  async loadMemoryVariables() {
    return await this.memory.loadMemoryVariables({});
  }

  async saveContext(input, output) {
    await this.memory.saveContext(input, output);
  }

  async clear() {
    await this.memory.clear();
  }
}

class EmotionalMemory extends ConversationMemory {
  constructor(windowSize = 5) {
    super(windowSize);
    this.emotionalState = {
      valence: 0, // -1 to 1 (negative to positive)
      arousal: 0, // 0 to 1 (calm to excited)
      dominance: 0 // -1 to 1 (submissive to dominant)
    };
    this.emotionKeywords = {
      positive: ['happy', 'excited', 'grateful', 'confident'],
      negative: ['sad', 'angry', 'anxious', 'frustrated'],
      aroused: ['excited', 'angry', 'anxious', 'energetic'],
      calm: ['peaceful', 'relaxed', 'content', 'serene'],
      dominant: ['confident', 'strong', 'in control', 'certain'],
      submissive: ['helpless', 'uncertain', 'confused', 'dependent']
    };
  }

  async saveContext(input, output) {
    // Update emotional state before saving
    this.updateEmotionalState(input.input);
    
    // Add emotional state to the context
    const enrichedOutput = {
      ...output,
      emotionalState: this.emotionalState
    };

    await super.saveContext(input, enrichedOutput);
  }

  updateEmotionalState(input) {
    const words = input.toLowerCase().split(' ');
    let newState = { ...this.emotionalState };

    // Update valence
    const positiveCount = words.filter(w => 
      this.emotionKeywords.positive.some(k => w.includes(k))).length;
    const negativeCount = words.filter(w => 
      this.emotionKeywords.negative.some(k => w.includes(k))).length;
    newState.valence = Math.tanh((positiveCount - negativeCount) * 0.5);

    // Update arousal
    const arousedCount = words.filter(w => 
      this.emotionKeywords.aroused.some(k => w.includes(k))).length;
    const calmCount = words.filter(w => 
      this.emotionKeywords.calm.some(k => w.includes(k))).length;
    newState.arousal = Math.tanh((arousedCount - calmCount) * 0.5);

    // Update dominance
    const dominantCount = words.filter(w => 
      this.emotionKeywords.dominant.some(k => w.includes(k))).length;
    const submissiveCount = words.filter(w => 
      this.emotionKeywords.submissive.some(k => w.includes(k))).length;
    newState.dominance = Math.tanh((dominantCount - submissiveCount) * 0.5);

    // Smooth the transition
    const alpha = 0.3; // Learning rate
    this.emotionalState = {
      valence: (1 - alpha) * this.emotionalState.valence + alpha * newState.valence,
      arousal: (1 - alpha) * this.emotionalState.arousal + alpha * newState.arousal,
      dominance: (1 - alpha) * this.emotionalState.dominance + alpha * newState.dominance
    };
  }

  getEmotionalSummary() {
    return {
      mood: this.getMoodLabel(),
      intensity: Math.abs(this.emotionalState.valence) * this.emotionalState.arousal,
      confidence: Math.abs(this.emotionalState.dominance)
    };
  }

  getMoodLabel() {
    const { valence, arousal } = this.emotionalState;
    if (valence > 0.3) {
      return arousal > 0.5 ? 'excited' : 'content';
    } else if (valence < -0.3) {
      return arousal > 0.5 ? 'distressed' : 'depressed';
    }
    return arousal > 0.5 ? 'tense' : 'neutral';
  }
}

module.exports = {
  ConversationMemory,
  EmotionalMemory
}; 