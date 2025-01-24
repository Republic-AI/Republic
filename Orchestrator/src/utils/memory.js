const { BufferMemory, ConversationSummaryMemory } = require("langchain/memory");
const { OpenAI } = require("langchain/llms/openai");

// Memory instances cache
const memoryInstances = {};

class AdvancedMemory {
  constructor(type = 'buffer') {
    this.type = type;
    this.memory = type === 'conversation' 
      ? new ConversationSummaryMemory({ llm: new OpenAI({ temperature: 0 }) })
      : new BufferMemory();
    this.history = [];
  }

  async saveContext(inputValues, outputValues) {
    this.history.push({ input: inputValues, output: outputValues, timestamp: new Date() });
    return this.memory.saveContext(inputValues, outputValues);
  }

  async loadMemoryVariables() {
    const vars = await this.memory.loadMemoryVariables();
    return {
      ...vars,
      history: this.history
    };
  }

  async clear() {
    this.history = [];
    return this.memory.clear();
  }
}

// Initialize memory based on configuration
const initializeMemory = (nodeId, memoryType) => {
  if (!memoryInstances[nodeId]) {
    memoryInstances[nodeId] = new AdvancedMemory(memoryType);
  }
  return memoryInstances[nodeId];
};

module.exports = {
  AdvancedMemory,
  initializeMemory,
  memoryInstances
}; 