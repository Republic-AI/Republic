const customHandler = require('./custom');
const inputHandler = require('./input');
const outputHandler = require('./output');
const twitterFetcherHandler = require('./twitterFetcher');

const handlers = {
  custom: customHandler,
  input: inputHandler,
  output: outputHandler,
  twitterFetcher: twitterFetcherHandler
};

module.exports = handlers; 