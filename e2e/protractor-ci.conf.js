const config = require('./protractor.conf').config;

config.capabilities = {
  allScriptsTimeout: 11000,
  browserName: 'chrome',
  chromeOptions: {
    args: ['--headless', '--no-sandbox']
  }
};

exports.config = config;
