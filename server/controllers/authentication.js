const jwt = require('jwt-simple');
const User = require('../db/models/user');

const config = require('../config/config');
const errorHandler = require('../db/error_handler');

const getTimeout = () => {
  const defaultTimeout = 60 * 60; // 1 hour
  const tokenTimeout = config.tokenTimeout;

  if (isNaN(tokenTimeout) || !tokenTimeout || tokenTimeout === 0) {
    return defaultTimeout;
  }
  return tokenTimeout;
};

function tokenForUser(user) {
  const secret = config.appSecret;
  const timestamp = Math.floor(Date.now() / 1000); // in seconds
  const exp = timestamp + getTimeout(); // Note: timed out requests return a 401
  // console.log('Token timeout is set to: ', getTimeout());
  return jwt.encode({ sub: user.id, iat: timestamp, exp }, secret);
}

module.exports.signin = function (req, res, next) {
  // user has already had their username/password authorized via middleware on the route.
  // We just need to give them a token and the user data
  // passport has set user object to req.user
  // Remove sensitive data before sending back user data
  req.user.password = undefined;
  req.user.salt = undefined;
  res.send({ token: tokenForUser(req.user), user: req.user });
};

module.exports.signup = function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName || '';
  const lastName = req.body.lastName || '';

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  if (!email || !password) {
    return res.status(422).send({ error: 'No email or password provided' });
  }

  // See if user with email exists
  User.findOne({ email }, (err, existingUser) => {
    if (err) {
      return next(err);
    }
    if (existingUser) {
      return res.status(422).send({ message: 'Email already exists' });
    }
    // If not exist, create and save the user record
    const user = new User({
      email,
      password,
      provider: 'local',
      displayName: `${firstName} ${lastName}`
    });
    user.save((err) => {
      console.log('user save error', err);
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      // Respond to request indicate user was created, give them back a JWT (json web token)
      // User ID + a secret string = JSON Web token
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;
      res.json({ token: tokenForUser(user), user });
    });
  });
};
