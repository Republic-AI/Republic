const { OpenAI } = require('langchain/llms/openai');
const BaseAgent = require('../core/BaseAgent');

// Simple in-memory vector store
class SimpleVectorStore {
  constructor() {
    this.vectors = new Map();
  }

  async upsert(id, vector, metadata) {
    this.vectors.set(id, { vector, metadata });
  }

  async query(queryVector, topK = 5) {
    // Simple cosine similarity search
    const scores = Array.from(this.vectors.entries()).map(([id, entry]) => ({
      id,
      score: this.cosineSimilarity(queryVector, entry.vector),
      metadata: entry.metadata
    }));

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async clear() {
    this.vectors.clear();
  }
}

class BabyAGIAgent extends BaseAgent {
  constructor(config) {
    super(config);
    
    // Core BabyAGI configuration
    this.objective = config.objective || '';
    this.initialTask = config.initialTask || '';
    this.modelName = config.modelName || 'gpt-4';
    this.maxIterations = config.maxIterations || 5;
    
    // Task management
    this.taskList = [];
    this.taskIdCounter = 1;
    this.tasksDone = [];
    this.vectorStore = new SimpleVectorStore();
  }

  async initialize() {
    // Check for required API key
    if (!this.config.apiKeys?.openai) {
      throw new Error('OpenAI API key is required but not provided in configuration');
    }

    // Initialize LLM
    this.llm = new OpenAI({
      modelName: this.modelName,
      temperature: 0.7,
      maxTokens: 2000,
      openAIApiKey: this.config.apiKeys.openai
    });
  }

  async createTask(taskDescription, dependentTaskId = null) {
    const task = {
      taskId: this.taskIdCounter++,
      taskName: taskDescription,
      dependentTaskId,
      status: 'pending',
      result: null,
      createdAt: new Date().toISOString()
    };
    
    this.taskList.push(task);
    return task;
  }

  async prioritizeTasks() {
    const taskNames = this.taskList.map(t => t.taskName).join(', ');
    const prompt = `You are an AI task prioritization system. You are reviewing the following tasks: ${taskNames}
    
Consider the objective: ${this.objective}
    
Analyze tasks for:
1. Dependency requirements
2. Complexity and time requirements
3. Value towards the objective
4. Current context and status
    
Provide a numbered list of these tasks in optimal order.`;

    const response = await this.llm.call(prompt);
    const prioritizedTaskNames = response.split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());

    // Reorder task list based on prioritization
    this.taskList = prioritizedTaskNames.map(name => 
      this.taskList.find(task => task.taskName.includes(name))
    ).filter(Boolean);
  }

  async executeTask(task) {
    const context = await this.getTaskContext(task);
    
    const prompt = `You are an AI agent working on the following objective: ${this.objective}
    
Current task: ${task.taskName}
Context from similar tasks: ${context}
    
Execute this task and provide:
1. Detailed results
2. Any new tasks identified
3. Status update`;

    const response = await this.llm.call(prompt);
    
    // Parse response for results and new tasks
    const [results, newTasks] = this.parseTaskResponse(response);
    
    // Update task status
    task.status = 'completed';
    task.result = results;
    this.tasksDone.push(task);
    
    // Store results in vector database
    await this.storeResult(task, results);
    
    // Create new tasks
    for (const newTask of newTasks) {
      await this.createTask(newTask, task.taskId);
    }
    
    return results;
  }

  async getTaskContext(task) {
    const embedding = await this.getEmbedding(task.taskName);
    const results = await this.vectorStore.query(embedding, 5);
    return results.map(match => match.metadata.result).join('\n');
  }

  async storeResult(task, result) {
    const embedding = await this.getEmbedding(task.taskName);
    await this.vectorStore.upsert(
      task.taskId.toString(),
      embedding,
      {
        taskName: task.taskName,
        result: result,
        objective: this.objective
      }
    );
  }

  parseTaskResponse(response) {
    // Split response into results and new tasks
    const sections = response.split('\n\n');
    const results = sections[0];
    const newTasks = sections
      .find(s => s.toLowerCase().includes('new tasks:'))
      ?.split('\n')
      .filter(line => line.trim() && !line.toLowerCase().includes('new tasks:'))
      .map(task => task.replace(/^-\s*/, '')) || [];
    
    return [results, newTasks];
  }

  async getEmbedding(text) {
    // Simple mock embedding - in production, use OpenAI's embedding API
    return Array(1536).fill(0).map(() => Math.random());
  }

  async execute(input) {
    try {
      await this.initialize();
      
      // Create initial task if none exists
      if (this.taskList.length === 0) {
        await this.createTask(this.initialTask || input);
      }
      
      let iteration = 0;
      while (this.taskList.length > 0 && iteration < this.maxIterations) {
        // Prioritize tasks
        await this.prioritizeTasks();
        
        // Get next task
        const task = this.taskList.shift();
        
        // Execute task
        const result = await this.executeTask(task);
        
        // Store in memory
        await this.memory.saveContext(
          { input: task.taskName },
          { output: result }
        );
        
        iteration++;
      }
      
      // Return final results
      return {
        tasksCompleted: this.tasksDone.map(task => ({
          taskName: task.taskName,
          result: task.result
        })),
        remainingTasks: this.taskList.length,
        iterations: iteration
      };
      
    } catch (error) {
      console.error('Error executing BabyAGI agent:', error);
      throw error;
    }
  }

  async cleanup() {
    await this.vectorStore.clear();
    if (this.memory) {
      await this.memory.cleanup();
    }
  }
}

// Handler function for BabyAGI agent
const executeBabyAGIAgent = async (input, config) => {
  const agent = new BabyAGIAgent(config);
  const result = await agent.execute(input);
  await agent.cleanup();
  return result;
};

module.exports = {
  BabyAGIAgent,
  executeBabyAGIAgent
}; 