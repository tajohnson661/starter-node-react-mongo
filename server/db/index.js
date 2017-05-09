const chalk = require('chalk');
const mongoose = require('mongoose');

module.exports.init = (config) => {
  mongoose.Promise = global.Promise;
  this.connect(config);
};

// Initialize Mongoose
module.exports.connect = (config) => {
  mongoose.connect(config.db.uri, config.db.options, (err) => {
    // Log Error
    if (err) {
      console.error(chalk.red('Could not connect to MongoDB!'));
      console.log(err);
    } else {
      // Enabling mongoose debug mode if required
      mongoose.set('debug', config.db.debug);
    }
  });
};

module.exports.disconnect = (cb) => {
  mongoose.disconnect((err) => {
    console.info(chalk.yellow('Disconnected from MongoDB.'));
    cb(err);
  });
};
