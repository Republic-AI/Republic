const twitterAgentHandler = require('./twitterAgent');
const discordAgentHandler = require('./discordAgent');
const telegramAgentHandler = require('./telegramAgent');
const analystAgentHandler = require('./analystAgent');

const handlers = {
  twitterAgent: twitterAgentHandler,
  discordAgent: discordAgentHandler,
  telegramAgent: telegramAgentHandler,
  analystAgent: analystAgentHandler
};

module.exports = handlers; 