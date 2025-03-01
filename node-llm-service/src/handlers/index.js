const twitterAgentHandler = require('./twitterAgent');
const discordAgentHandler = require('./discordAgent');
const telegramAgentHandler = require('./telegramAgent');
const analystAgentHandler = require('./analystAgent');
const twitterFetcherHandler = require('./twitterFetcher');
const promptToAgentHandler = require('./promptToAgentHandler');

const handlers = {
  twitterAgent: twitterAgentHandler,
  discordAgent: discordAgentHandler,
  telegramAgent: telegramAgentHandler,
  analystAgent: analystAgentHandler,
  twitterFetcher: twitterFetcherHandler,
  promptToAgent: promptToAgentHandler,
  custom: async (node) => {
    // Simply pass through any input data
    return node.data.input || {};
  },
  // Add output handler
  output: async (node) => {
    // Simply return the input data
    return node.data;
  }
};

module.exports = handlers; 