const chai = require('chai');
const chaiHttp = require('chai-http');
const seeder = require('mongoose-seed');

const server = require('../../server');
const config = require('../config/config');

const ROOT_URL = '/api/tags';

const KNOWN_ID1 = '507f191e810c19729de860eb';
const KNOWN_ID2 = '590288a6bdd8d128bba7e524';
const UNKNOWN_ID = '1111191e810c19729de860eb';
const KNOWN_NOTE_ID1 = '590288a6bdd8d128bba7e550';

let token;

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
  },
  {
    model: 'Tag',
    documents: [
      {
        _id: KNOWN_ID1,
        name: 'tag1'
      },
      {
        name: 'tag2'
      },
      {
        _id: KNOWN_ID2,
        name: 'tag3'
      }
    ]
  },
  {
    model: 'Note',
    documents: [
      {
        _id: KNOWN_NOTE_ID1,
        text: 'this is some note text',
        tags: [
          KNOWN_ID1, KNOWN_ID2
        ]
      },
      {
        text: 'this is another note'
      }

    ]
  }
];

const seedData = () => {
  return new Promise(function (resolve, reject) {
    const consoleFunc = console.log;
    console.log = () => {};
    seeder.connect(config.db.uri, () => {
      seeder.loadModels(['server/db/models/user.js', 'server/db/models/tag.js', 'server/db/models/note.js']);
      seeder.clearModels(['User', 'Tag', 'Note'], () => {
        seeder.populateModels(data, () => {
          console.log = consoleFunc;
          resolve();
        });
      });
    });
  });
};

function login() {
  return new Promise(
    function (resolve, reject) {
      chai.request(server)
        .post('/api/auth/signin')
        .send({ email: 'jane@example.com', password: '1234abcd' })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          token = res.body.token;
          resolve(res);
        });
    }
  );
}
/* Mocha prefers not using arrow functions */
/* eslint prefer-arrow-callback: 0 */

describe('Tags Api', function () {
  beforeEach('prep tags data', function () {
    return seedData();
  });


  describe('create', function () {
    beforeEach('login', function () {
      return login();
    });

    it('should create data', function (done) {
      chai.request(server)
        .post(`${ROOT_URL}`)
        .set('authorization', token)
        .send({ name: 'hi there' })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.name).to.equal('hi there');
          done();
        });
    });

    it('should create data and then find it', function (done) {
      chai.request(server)
        .post(`${ROOT_URL}`)
        .set('authorization', token)
        .send({ name: 'hi there' })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          const id = res.body._id;
          chai.request(server)
            .get(`${ROOT_URL}/${id}`)
            .set('authorization', token)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res.body).to.be.an('object');
              expect(res.body.name).to.equal('hi there');
              done();
            });
        });
    });
  });

  describe('list', function () {
    describe('no access if not logged in', function () {
      it('should not be able to retrieve data if not logged in', function (done) {
        chai.request(server)
          .get(`${ROOT_URL}`)
          .end(function (err, res) {
            expect(res).to.have.status(401);
            done();
          });
      });
    });

    describe('list', function () {
      beforeEach('login', function () {
        return login();
      });

      it('should retrieve data', function (done) {
        chai.request(server)
          .get(`${ROOT_URL}`)
          .set('authorization', token)
          .end(function (err, res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('array');
            expect(res.body[0]).to.be.an('object');
            expect(res.body[0].name).to.equal('tag1');
            done();
          });
      });
    });
  });

  describe('read', function () {
    beforeEach('login', function () {
      return login();
    });

    it('should retrieve a tag by id', function (done) {
      chai.request(server)
        .get(`${ROOT_URL}/${KNOWN_ID2}`)
        .set('authorization', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.name).to.equal('tag3');
          done();
        });
    });

    it('should fail on retrieving a tag with unknown id', function (done) {
      chai.request(server)
        .get(`${ROOT_URL}/${UNKNOWN_ID}`)
        .set('authorization', token)
        .end(function (err, res) {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe('update', function () {
    beforeEach('login', function () {
      return login();
    });

    it('should update a tag by id', function (done) {
      chai.request(server)
        .put(`${ROOT_URL}/${KNOWN_ID1}`)
        .set('authorization', token)
        .send({ name: 'hi there' })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.name).to.equal('hi there');
          done();
        });
    });
    it('should update a tag by id and then be able to find it', function (done) {
      chai.request(server)
        .put(`${ROOT_URL}/${KNOWN_ID1}`)
        .set('authorization', token)
        .send({ name: 'hi there' })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          chai.request(server)
            .get(`${ROOT_URL}/${KNOWN_ID1}`)
            .set('authorization', token)
            .end(function (err, res) {
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(res.body).to.be.an('object');
              expect(res.body.name).to.equal('hi there');
              done();
            });
        });
    });
  });

  describe('delete', function () {
    beforeEach('login', function () {
      return login();
    });

    it('should delete a tag by id', function (done) {
      chai.request(server)
        .delete(`${ROOT_URL}/${KNOWN_ID1}`)
        .set('authorization', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should delete a tag by id and then not find it', function (done) {
      chai.request(server)
        .delete(`${ROOT_URL}/${KNOWN_ID1}`)
        .set('authorization', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          chai.request(server)
            .get(`${ROOT_URL}/${KNOWN_ID1}`)
            .set('authorization', token)
            .end(function (err, res) {
              expect(res).to.have.status(404);
              done();
            });
        });
    });

    it('should fail deleting a tag by invalid id', function (done) {
      chai.request(server)
        .delete(`${ROOT_URL}/${UNKNOWN_ID}`)
        .set('authorization', token)
        .end(function (err, res) {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe('notesByTag', function () {
    beforeEach('login', function () {
      return login();
    });

    it('should retrieve notes by a tag id', function (done) {
      chai.request(server)
        .get(`${ROOT_URL}/${KNOWN_ID1}/notes`)
        .set('authorization', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(1);
          expect(res.body[0]).to.be.an('object');
          expect(res.body[0].text).to.equal('this is some note text');
          done();
        });
    });
  });
});
