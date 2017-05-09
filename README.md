# Node, React, Redux, Mongo Starter

This project is a starter application for Node and React.  The application uses [this full-stack project](https://github.com/fullstackreact/food-lookup-demo) as the starting point to define the client/server architecture.  The server is a standard node/express application.

The react (client) app uses ```create-react-app``` as a starting point as well as for configuration.  See [their website](https://github.com/facebookincubator/create-react-app) for more information.

In this architecture, a production build is run as a single application where the server hosts the client files. This means that the client can request the API at the same URL:port as the server.  In development, the client is served up by create-react-app's standard webpack dev server on port 3000.  The server will run on port 3001, and a proxy is set up so the client can talk to the server without specifying a port in the code.

## Technologies used:

###Tools and Configuration:
* yarn
* eslint (using airbnb configuration as the base, and relaxed as desired)

###Server:
* Node
* Express
* MongoDB / Mongoose
* Mocha / Chai

###Client:
* React
* Redux
* redux-form
* Jest / Enzyme

###Authentication:
* passport
* JWT

## Setup

You'll need to have yarn installed.  The best way to do that is to install it via homebrew on your Mac.

```
brew update
brew install yarn
```
You'll also need to install MongoDB or have access to a third party MongoDB provider.  If you want to install it locally, use homebrew.  Then run it as follows:

```
mongod --config /usr/local/etc/mongod.conf
tail -f /usr/local/var/log/mongodb/mongo.log (in a separate shell)
```
Ok, you're ready to go.  Now set up the project by installing libraries for both the client and server...

```
git clone git@github.com:tajohnson661/node-starter-react-mongo.git your_project
cd your_project
yarn install

cd client
yarn install

cd ..
npm start
```
## Seed data
Create some initial data in your development database

```
npm run db:seed
```
## Testing
### Server testing:

```
npm test
```
By default, server tests run once.  To automatically run tests on code changes, use this:

```
npm run test-server-watch
```

### Client testing:

```
cd client
npm test
```
By default, client tests will run on code changes

## Lint
Linting is setup.  Most editors have real-time lint checking, which will find many JS errors before you run the app.  You can run it manually as well...

```
npm run lint
```
The configuration is setup in the .eslintrc.json file in the root directory.  We start with airbnb guidelines, but that's way too strict, so we change some things in the rules section.

## Swagger
Swagger is (sort of) setup.  The basic infrastructure is in there to create API docs, but the actual swagger.yaml file is not implemented yet. It's still a default uber api file.

## Technology Overview

`create-react-app` configures a Webpack development server to run on `localhost:3000`. This development server will bundle all static assets located under `client/src/`. All requests to `localhost:3000` will serve `client/index.html` which will include Webpack's `bundle.js`.

To prevent any issues with CORS, the user's browser will communicate exclusively with the Webpack development server.

Client requests are made to `localhost:3000`, the Webpack dev server. Webpack will infer that this request is actually intended for our API server. We specify in `package.json` that we would like Webpack to proxy API requests to `localhost:3001`:

```js
// Inside client/package.json
"proxy": "http://localhost:3001/",
```

This handy features is provided for us by `create-react-app`.

Therefore, the user's browser makes a request to Webpack at `localhost:3000` which then proxies the request to our API server at `localhost:3001`:

This setup provides two advantages:

1. If the user's browser tried to request `localhost:3001` directly, we'd run into issues with CORS.
2. The API URL in development matches that in production. You don't have to do something like this:

```js
// Example API base URL determination in Client.js
const apiBaseUrl = process.env.NODE_ENV === 'development' ? 'localhost:3001' : '/'
```

This setup uses [concurrently](https://github.com/kimmobrunfeldt/concurrently) for process management. Executing `npm start` instructs `concurrently` to boot both the Webpack dev server and the API server.

## Database

### Setup 
The application uses MongoDB.  **You'll need to have MongoDB running, and have a database created**.  Change the database configuration for development in /server/config/development.js file.  In production, an environment variable that depends on the mongo service will be used to connect to the database.  See the production config file.


## Deploying to Heroku

### Background

The app is ready to be deployed to Heroku.

In production, Heroku will use `Procfile` which boots just the server:

```
web: npm run server
```

Inside `server.js`, we tell Node/Express we'd like it to serve static assets in production:

```
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}
```

You just need to have Webpack produce a static bundle of the React app (below).

### Steps

We assume basic knowledge of Heroku.

**0. Setup your Heroku account and Heroku CLI**

For installing the CLI tool, see [this article](https://devcenter.heroku.com/articles/heroku-command-line).

**1. Create the Heroku app (one time only)**

```
heroku create <your-unique-appname>
```

**2. Create a MongoDB database**

Heroku let's you set up a MongoDB database through mLab using an add-on.  See the documentation on how to get this setup.  You'll need to set the MONGODB_URI environment variable in Heroku to the database connection URI.

**3. Build the React (client) app**

Running `npm run build` creates the static bundle which we can then use any HTTP server to serve:

```
cd client/
npm run build
```

**4. Deploy to heroku**

From the root of the project:

```
git checkout -b deploy    // create a new branch for this process
git add -f client/build    // add client build files even though they're in .gitignore
git commit -m "deploy"
git push -f heroku deploy:master  // force the push.
git checkout <original branch>
git branch -D deploy
```

Heroku will give you a link at which to view your live app.

## ToDo

Believe it or not, this isn't perfect.  There are some things I'd like to add, but haven't had time yet.

* Travis CI and the associated badge
* Social login
* Roles and permissions
* React router version 4 (still using v2)
* e2e testing
* action and reducer testing
* Swagger completion

