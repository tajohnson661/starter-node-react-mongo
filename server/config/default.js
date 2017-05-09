module.exports = {
  app: {
    title: 'starter-node-react-mongo',
    description: 'Starter app using node, react, mongodb',
    keywords: 'node react mongodb',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
  },
  port: process.env.PORT || 3001,
  tokenTimeout: 3600,
  appSecret: process.env.APP_SECRET || 'starter-node-react-mongo',
  logo: 'client/public/logo.png',
  favicon: 'client/public/favicon.ico'
};
