const defaultEnvConfig = require('./default');

module.exports = {
  app: {
    title: `${defaultEnvConfig.app.title} - Test Environment`
  },
  port: process.env.PORT || 3001,
  db: {
    uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI ||
    `mongodb://${(process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost')}/starter-node-react-mongo-test`,
    options: {
      user: '',
      pass: ''
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  appSecret: '04e8f6c7-9eb7-402b-bb70-9d9c8d037d9a'
};
