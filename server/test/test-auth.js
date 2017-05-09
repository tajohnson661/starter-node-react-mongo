const chai = require('chai');
const chaiHttp = require('chai-http');
const seeder = require('mongoose-seed');

const server = require('../../server');
const config = require('../config/config');

const ROOT_URL = '/api/auth';

chai.use(chaiHttp);
const expect = chai.expect;

const data = [
  {
    model: 'User',
    documents: [
      {
        firstName: 'Bill',
        lastName: 'Murray',
        email: 'bill@example.com',
        password: 'abcd1234'
      },
      {
        firstName: 'Jane',
        lastName: 'Curtin',
        email: 'jane@example.com',
        password: '1234abcd',
        roles: ['admin']
      }
    ]
  }
];
const seedData = () => {
  return new Promise(function (resolve, reject) {
    const consoleFunc = console.log;
    console.log = () => {};
    seeder.connect(config.db.uri, () => {
      seeder.loadModels(['server/db/models/user.js']);
      seeder.clearModels(['User'], () => {
        seeder.populateModels(data, () => {
          console.log = consoleFunc;
          resolve();
        });
      });
    });
  });
};

/* Mocha prefers not using arrow functions */
/* eslint prefer-arrow-callback: 0 */

describe('Auth Api', function () {
  beforeEach('prep database', function () {
    return seedData();
  });

  it('should login', function (done) {
    chai.request(server)
      .post(`${ROOT_URL}/signin`)
      .send({ email: 'jane@example.com', password: '1234abcd' })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('token');
        expect(res.body).to.have.property('user');
        expect(res.body.token).to.be.a('string');
        expect(res.body.user).to.be.an('object');
        expect(res.body.user).to.have.property('_id');
        expect(res.body.user).to.have.property('firstName');
        expect(res.body.user).to.have.property('lastName');
        expect(res.body.user).to.have.property('email');
        expect(res.body.user.firstName).to.equal('Jane');
        done();
      });
  });

  it('should fail login', function (done) {
    chai.request(server)
      .post(`${ROOT_URL}/signin`)
      .send({ email: 'jane1@example.com', password: '1234abcd' })
      .end(function (err, res) {
        expect(res).to.have.status(401);
        done();
      });
  });

  it('should sign up a user', function (done) {
    chai.request(server)
      .post(`${ROOT_URL}/signup`)
      .send({ email: 'newuser@example.com', password: '1234abcd', firstName: 'New', lastName: 'User' })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('token');
        expect(res.body).to.have.property('user');
        expect(res.body.token).to.be.a('string');
        expect(res.body.user).to.be.an('object');
        expect(res.body.user).to.have.property('_id');
        expect(res.body.user).to.have.property('firstName');
        expect(res.body.user).to.have.property('lastName');
        expect(res.body.user).to.have.property('email');
        expect(res.body.user.email).to.equal('newuser@example.com');
        done();
      });
  });

  it('should fail signup when user has no password', function (done) {
    chai.request(server)
      .post(`${ROOT_URL}/signup`)
      .send({ email: 'newuser2@example.com', firstName: 'New', lastName: 'User' })
      .end(function (err, res) {
        expect(res).to.have.status(422);
        done();
      });
  });
});
