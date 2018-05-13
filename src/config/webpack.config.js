var path = require('path');
var useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

module.exports = function () {
  useDefaultConfig[process.env.IONIC_ENV].resolve.alias = {
    "@environment": path.resolve(__dirname + '/../../src/config/environment.' + process.env.IONIC_ENV + '.ts'),
  };
  return useDefaultConfig;
};
