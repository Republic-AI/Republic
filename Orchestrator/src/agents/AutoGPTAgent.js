const BaseAgent = require('../core/BaseAgent');
const { WebBrowser } = require("langchain/tools");
const { Calculator } = require("langchain/tools");
const { WikipediaQueryRun } = require("langchain/tools");

class AutoGPTAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.name = config.agentName || 'AutoGPT';
    this.description = config.agentDescription || 'An autonomous agent powered by AutoGPT';
    this.goals = config.goals || [];
    this.maxIterations = config.maxIterations || 5;
    this.tools = this.initializeTools(config.tools || []);
  }

  initializeTools(toolNames) {
    return toolNames.map(name => {
      switch (name) {
        case 'web-search':
          return new WebBrowser();
        case 'calculator':
          return new Calculator();
        case 'wikipedia':
          return new WikipediaQueryRun();
        default:
          return null;
      }
    }).filter(Boolean);
  }

  async planNextStep(context, previousActions = []) {
    const prompt = `
System: You are ${this.name}, an autonomous agent with the following goals:
${this.goals.map((goal, i) => `${i + 1}. ${goal}`).join('\n')}

Current Context:
${context}

Previous Actions:
${previousActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

Based on your goals and the current context, determine the next best action to take.
Respond in the following format:
ACTION: [The action to take]
REASON: [Why this action is the best next step]
`;

    const response = await this.model.call(prompt);
    return this.parseResponse(response);
  }

  parseResponse(response) {
    try {
      const actionMatch = response.match(/ACTION:\s*(.+?)(?=\n|$)/);
      const reasonMatch = response.match(/REASON:\s*(.+?)(?=\n|$)/);
      
      return {
        action: actionMatch ? actionMatch[1].trim() : '',
        reason: reasonMatch ? reasonMatch[1].trim() : ''
      };
    } catch (error) {
      console.error('Error parsing response:', error);
      return { action: '', reason: '' };
    }
  }

  async execute(input) {
    const context = await this.memory.loadMemoryVariables();
    const actions = [];
    let currentContext = input;
    let iteration = 0;

    while (iteration < this.maxIterations) {
      // Plan next step
      const plan = await this.planNextStep(currentContext, actions);
      
      if (!plan.action) {
        break;
      }

      // Execute the planned action
      try {
        const result = await this.model.call(plan.action);
        actions.push(`${plan.action} -> ${result}`);
        currentContext = result;
        
        // Save to memory
        await this.memory.saveContext(
          { input: plan.action },
          { output: result }
        );

        // Check if goals are achieved
        const checkGoalsPrompt = `
Given the following goals:
${this.goals.map((goal, i) => `${i + 1}. ${goal}`).join('\n')}

And the current context:
${currentContext}

Have all goals been achieved? Respond with YES or NO and explain why.
`;
        
        const goalsCheck = await this.model.call(checkGoalsPrompt);
        if (goalsCheck.toLowerCase().includes('yes')) {
          break;
        }

      } catch (error) {
        console.error('Error executing action:', error);
        actions.push(`Error: ${error.message}`);
      }

      iteration++;
    }

    // Format final response
    return {
      finalContext: currentContext,
      actions: actions,
      iterations: iteration,
      goalsAchieved: iteration < this.maxIterations
    };
  }
}

// Handler function for AutoGPT agent
const executeAutoGPTAgent = async (input, config) => {
  const agent = new AutoGPTAgent(config);
  const result = await agent.execute(input);
  return result;
};

module.exports = {
  AutoGPTAgent,
  executeAutoGPTAgent
}; 