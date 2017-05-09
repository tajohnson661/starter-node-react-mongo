const chai = require('chai');
const chaiHttp = require('chai-http');
const seeder = require('mongoose-seed');

const server = require('../../server');
const config = require('../config/config');

const ROOT_URL = '/api/notes';
const KNOWN_ID = '590271399cd95b15a2a07ca2';
const UNKNOWN_ID = '111171399cd95b15a2a07ca2';
const KNOWN_USER_ID1 = '59028418d3e6802552fee34b';
const KNOWN_USER_ID2 = '59028418d3e6802552fee34c';
const KNOWN_TAG_ID1 = '590288a6bdd8d128bba7e522';
const KNOWN_TAG_ID2 = '590288a6bdd8d128bba7e523';
const KNOWN_TAG_ID3 = '507f191e810c19729de860ea';

let token;
let loggedInUser;

chai.use(chaiHttp);
const expect = chai.expect;
const data = [
  {
    model: 'User',
    documents: [
      {
        _id: KNOWN_USER_ID1,
        firstName: 'Bill',
        lastName: 'Murray',
        email: 'bill@example.com',
        password: 'abcd1234'
      },
      {
        _id: KNOWN_USER_ID2,
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
        _id: KNOWN_TAG_ID1,
        name: 'tag1'
      },
      {
        _id: KNOWN_TAG_ID2,
        name: 'tag2'
      },
      {
        _id: KNOWN_TAG_ID3,
        name: 'tag3'
      }
    ]
  },
  {
    model: 'Note',
    documents: [
      {
        _id: KNOWN_ID,
        text: 'this is some note text',
        user: KNOWN_USER_ID1,
        tags: [
          KNOWN_TAG_ID1, KNOWN_TAG_ID3
        ]
      },
      {
        text: 'this is another note',
        user: KNOWN_USER_ID2
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
          loggedInUser = res.body.user;
          resolve(res);
        });
    }
  );
}
/* Mocha prefers not using arrow functions */
/* eslint prefer-arrow-callback: 0 */

describe('Notes Api', function () {
  beforeEach('prep notes data', function () {
    return seedData();
  });


  describe('create', function () {
    beforeEach('login', function () {
      return login();
    });

    it('should create a note', function (done) {
      chai.request(server)
        .post(`${ROOT_URL}`)
        .set('authorization', token)
        .send({ text: 'hi there' })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.text).to.equal('hi there');
          expect(res.body.user).to.equal(loggedInUser._id);
          done();
        });
    });

    it('should create a note and add an existing tag', function (done) {
      chai.request(server)
        .post(`${ROOT_URL}`)
        .set('authorization', token)
        .send({ text: 'hi there', tags: [KNOWN_TAG_ID1] })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.text).to.equal('hi there');
          expect(res.body.tags).to.be.an('array');
          expect(res.body.tags[0]).to.be.an('object');
          expect(res.body.tags[0].name).to.equal('tag1');
          expect(res.body.user).to.equal(loggedInUser._id);
          done();
        });
    });

    it('should create data and then find it', function (done) {
      chai.request(server)
        .post(`${ROOT_URL}`)
        .set('authorization', token)
        .send({ text: 'hi there' })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          const id = res.body._id;
          chai.request(server)
            .get(`/api/notes/${id}`)
            .set('authorization', token)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res.body).to.be.an('object');
              expect(res.body.text).to.equal('hi there');
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
            expect(res.body).to.have.lengthOf(2);
            // TODO: timestamps will probably be the same on load, so this won't always work
            const oldestNote = res.body[1];
            expect(oldestNote).to.be.an('object');
            expect(oldestNote.text).to.equal('this is some note text');
            // Make sure we also retrieve any tags for the note
            expect(oldestNote.tags).to.be.an('array');
            expect(oldestNote.tags).to.have.lengthOf(2);
            expect(oldestNote.tags[0].name).to.equal('tag1');
            done();
          });
      });

      it('should retrieve data by user id', function (done) {
        chai.request(server)
          .get(`${ROOT_URL}?userId=${loggedInUser._id}`)
          .set('authorization', token)
          .end(function (err, res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0]).to.be.an('object');
            expect(res.body[0].text).to.equal('this is another note');
            done();
          });
      });
    });
  });

  describe('read', function () {
    beforeEach('login', function () {
      return login();
    });

    it('should retrieve a note by id', function (done) {
      chai.request(server)
        .get(`${ROOT_URL}/${KNOWN_ID}`)
        .set('authorization', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.text).to.equal('this is some note text');
          // Make sure we also retrieve any tags for the note
          expect(res.body.tags).to.be.an('array');
          expect(res.body.tags).to.have.lengthOf(2);
          expect(res.body.tags[0].name).to.equal('tag1');
          done();
        });
    });

    it('should fail on retrieving a note with unknown id', function (done) {
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

    it('should update a note by id and tags should still be there', function (done) {
      chai.request(server)
        .put(`${ROOT_URL}/${KNOWN_ID}`)
        .set('authorization', token)
        .send({ text: 'hi there' })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.text).to.equal('hi there');
          expect(res.body.tags).to.be.an('array');
          expect(res.body.tags).to.have.lengthOf(2);
          expect(res.body.tags[0].name).to.equal('tag1');
          done();
        });
    });

    it('should update a note by id and update tags', function (done) {
      chai.request(server)
        .put(`${ROOT_URL}/${KNOWN_ID}`)
        .set('authorization', token)
        .send({ text: 'hi there', tags: [KNOWN_TAG_ID2, KNOWN_TAG_ID3] })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.text).to.equal('hi there');
          expect(res.body.tags).to.be.an('array');
          expect(res.body.tags).to.have.lengthOf(2);
          expect(res.body.tags[0].name).to.equal('tag2');
          done();
        });
    });
    it('should update a note by id and then be able to find it', function (done) {
      chai.request(server)
        .put(`${ROOT_URL}/${KNOWN_ID}`)
        .set('authorization', token)
        .send({ text: 'hi there' })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          chai.request(server)
            .get(`${ROOT_URL}/${KNOWN_ID}`)
            .set('authorization', token)
            .end(function (err, res) {
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(res.body).to.be.an('object');
              expect(res.body.text).to.equal('hi there');
              done();
            });
        });
    });
  });

  describe('delete', function () {
    beforeEach('login', function () {
      return login();
    });

    it('should delete a note by id', function (done) {
      chai.request(server)
        .delete(`${ROOT_URL}/${KNOWN_ID}`)
        .set('authorization', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should delete a note by id and then not find it', function (done) {
      chai.request(server)
        .delete(`${ROOT_URL}/${KNOWN_ID}`)
        .set('authorization', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          chai.request(server)
            .get(`${ROOT_URL}/${KNOWN_ID}`)
            .set('authorization', token)
            .end(function (err, res) {
              expect(res).to.have.status(404);
              done();
            });
        });
    });

    it('should fail deleting a note by invalid id', function (done) {
      chai.request(server)
        .delete(`${ROOT_URL}/${UNKNOWN_ID}`)
        .set('authorization', token)
        .end(function (err, res) {
          expect(res).to.have.status(404);
          done();
        });
    });
  });
  describe('tagsByNote', function () {
    beforeEach('login', function () {
      return login();
    });

    it('should retrieve tags by a note id', function (done) {
      chai.request(server)
        .get(`${ROOT_URL}/${KNOWN_ID}/tags`)
        .set('authorization', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(2);
          expect(res.body[0]).to.be.an('object');
          expect(res.body[0].name).to.equal('tag3');
          done();
        });
    });
  });
});
