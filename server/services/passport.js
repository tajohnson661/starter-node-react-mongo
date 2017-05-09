const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

const config = require('../config/config');
const User = require('../db/models/user');

module.exports.init = () => {
  // We use a jwt strategy when the user is already logged in, and we're just checking to
  // make sure they're actually logged in.
  // Set up options for Jwt strategy

// Create local (username,password) strategy.
// This strategy is used only when the user is trying to log in.
  const localOptions = {
    usernameField: 'email', // use the email property of the data sent in as passport's user name
    passwordField: 'password'
  };
  const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
    // Verify the email and password and call 'done' with the user
    // if not good, call 'done' with false
    User.findOne({ email }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user || !user.authenticate(password)) {
        return done(null, false, {
          message: 'Invalid email or password'
        });
      }
      return done(null, user);
    });
  });

// We use a jwt strategy when the user is already logged in, and we're just checking to
// make sure they're actually logged in.
// Set up options for Jwt strategy
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),  // where we get the jwt from
    secretOrKey: config.appSecret
  };

  // Create a passport strategy based on JWT
  const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
    // See if the UserID in the payload exists in our database
    // If it does, call 'done' with that user.
    // Otherwise, call 'done' without a user object
    User.findById(payload.sub, (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  });

  // Tell passport to use this strategy
  passport.use(jwtLogin);
  passport.use(localLogin);
};
