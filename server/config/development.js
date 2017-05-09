const defaultEnvConfig = require('./default');

module.exports = {
  app: {
    title: `${defaultEnvConfig.app.title} - Development Environment`
  },
  db: {
    uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI ||
      `mongodb://${(process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost')}/starter-node-react-mongo-dev`,
    options: {
      user: '',
      pass: ''
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  appSecret: '169d2da3-c4c1-46b8-a0d5-0e00a9febc9c'
};
