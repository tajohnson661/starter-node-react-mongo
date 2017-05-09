const _ = require('lodash');
const chalk = require('chalk');
const glob = require('glob');
const fs = require('fs');
const path = require('path');

/**
 * Validate NODE_ENV existence
 */
const validateEnvironmentVariable = () => {
  const environmentFiles = glob.sync(`./server/config/${process.env.NODE_ENV}.js`);
  if (!environmentFiles.length) {
    if (process.env.NODE_ENV) {
      console.error(chalk.red(`+ Error: No configuration file found for "${process.env.NODE_ENV}"
      environment using development instead`));
    } else {
      console.warn(chalk.green('+ Warning: NODE_ENV is not defined! Using default development environment'));
    }
    process.env.NODE_ENV = 'development';
  }
  // Reset console color
  console.log(chalk.white(''));
};

/**
 * Validate Secure=true parameter can actually be turned on
 * because it requires certs and key files to be available
 */
const validateSecureMode = (config) => {
  if (!config.secure || config.secure.ssl !== true) {
    return true;
  }

  const privateKey = fs.existsSync(path.resolve(config.secure.privateKey));
  const certificate = fs.existsSync(path.resolve(config.secure.certificate));

  if (!privateKey || !certificate) {
    console.log(chalk.red('+ Error: Certificate file or key file is missing, falling back to non-SSL mode'));
    console.log(chalk.red(`  To create them, simply run the following from your shell: 
sh ./scripts/generate-ssl-certs.sh`));
    console.log();
    config.secure.ssl = false;
  }
};

/**
 * Validate App Secret parameter is not set to default in production
 */
const validateSecret = (config) => {
  if (config.appSecret === 'starter-node-react-mongo') {
    console.log(chalk.red(`+ WARNING: It is strongly recommended
    that you change appSecret config while running in production!`));
    console.log(chalk.red('  Please add `appSecret: process.env.APP_SECRET || \'super amazing secret\'` to '));
    console.log(chalk.red('  `config/production.js` or `config/local.js`'));
    console.log();
    return false;
  }
  return true;
};
/**
 * Initialize global configuration
 */
const initGlobalConfig = () => {
  // Validate NODE_ENV existence
  validateEnvironmentVariable();

  // Get the default config
  const defaultConfig = require(path.join(process.cwd(), 'server/config/default'));

  // Get the current config
  const environmentConfig = require(path.join(process.cwd(), 'server/config/', process.env.NODE_ENV)) || {};

  // Merge config files
  let config = _.merge(defaultConfig, environmentConfig);

  // We only extend the config object with the local.js custom/local environment if we are on
  // production or development environment. If test environment is used we don't merge it with local.js
  // to avoid running test suites on a prod/dev environment (which delete records and make modifications)
  if (process.env.NODE_ENV !== 'test') {
    config = _.merge(config, (fs.existsSync(path.join(process.cwd(), 'server/config/local.js')) &&
      require(path.join(process.cwd(), 'server/config/local.js'))) || {});
  }

  // Validate Secure SSL mode can be used
  validateSecureMode(config);

  // Validate session secret
  validateSecret(config);

  return config;
};

/**
 * Set configuration object
 */
module.exports = initGlobalConfig();
