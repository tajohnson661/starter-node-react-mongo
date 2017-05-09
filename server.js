const config = require('./server/config/config');
const app = require('./server/server');

module.exports = app.start(config);
