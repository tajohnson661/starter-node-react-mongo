const seeder = require('mongoose-seed');
const config = require('../../config/config');

const data = [
  {
    model: 'User',
    documents: [
      {
        firstName: 'user',
        lastName: 'user',
        email: 'user@example.com',
        password: 'abcd1234',
        roles: ['user']
      },
      {
        firstName: 'admin',
        lastName: 'admin',
        email: 'admin@example.com',
        password: 'abcd1234',
        roles: ['admin']
      }
    ]
  },
  {
    model: 'Tag',
    documents: [
      {
        name: 'tag1'
      },
      {
        name: 'tag2'
      },
      {
        _id: '507f191e810c19729de860ea',
        name: 'tag3'
      }
    ]
  }
];

seeder.connect(config.db.uri, () => {
  seeder.loadModels(['server/db/models/user.js', 'server/db/models/tag.js']);
  seeder.clearModels(['User', 'Tag'], () => {
    seeder.populateModels(data, function() {
      console.log('done seeding database');
      process.exit(0);
    })
  });
});

