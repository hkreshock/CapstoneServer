'use strict';

const knex = require('knex');
const app = require('../src/app');
const { makeListsArray } = require('./lists.fixtures');
const supertest = require('supertest');
const { expect } = require('chai');

describe('Lists Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  before(() => {
    () => db('grocery_lists').truncate();
  });

  afterEach('cleanup', () => db('grocery_lists').truncate());

  after(() => db.destroy());

  describe('GET /lists', () => {
    // in order to have all tests passing, first comment out the requireAuth from the routers
    context('Given no lists', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/lists')
          .expect(200, []);
      });
    });
    context('Given there are lists in the database', () => {
      let testLists = makeListsArray();

      beforeEach('insert lists', () => {
        return db.into('grocery_lists').insert(testLists);
      });

      it('GET /lists responds with 200 and all of the lists', () => {
        return supertest(app)
          .get('/lists')
          .expect(200, testLists);
      });
    });
  });

  describe('GET /lists/:list_id', () => {
    // in order to have all tests passing, first comment out the requireAuth from the routers
    context('Given no lists', () => {
      it('responds with 404', () => {
        const listId = 123456;
        return supertest(app)
          .get(`/lists/${listId}`)
          .expect(404, { error: { message: 'List doesn\'t exist' } });
      });
    });
    context('Given there are lists in the database', () => {
      context('Given an XSS attack list', () => {
        const maliciousList = {
          id: 911,
          title: 'Naughty naughty very naughty <script>alert("xss");</script>',
          userid:
            'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.'
        };

        beforeEach('insert malicious list', () => {
          return db.into('grocery_lists').insert([maliciousList]);
        }) +
          it('removes XSS attack content', () => {
            return supertest(app)
              .get(`/lists/${maliciousList.id}`)
              .expect(200)
              .expect(res => {
                expect(res.body.title).to.eql(
                  'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;'
                );
                expect(res.body.userid).to.eql(
                  'Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.'
                );
              });
          });
      });
      let testLists = makeListsArray();

      beforeEach('insert lists', () => {
        return db.into('grocery_lists').insert(testLists);
      });

      it('GET /list/:list_id responds with 200 and the specified list', () => {
        const listId = 2;
        const expectedList = testLists[listId - 1];
        return supertest(app)
          .get(`/lists/${listId}`)
          .expect(200, expectedList);
      });
    });
  });
  describe('POST /lists', () => {
    // in order to have all tests passing, first comment out the requireAuth from the routers
    const newList = {
      title: 'Test new list',
      userid: '0'
    };
    it('creates an list, responding with 201 and the new list', function() {
      this.retries(3);
      return supertest(app)
        .post('/lists')
        .send(newList)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newList.title);
          expect(res.body.userid).to.eql(newList.userid);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/lists/${res.body.id}`);
          const expectedDate = new Date().toLocaleString('en', {
            timeZone: 'America/Phoenix'
          });
          const actualDate = new Date(res.body.date_created).toLocaleString();
          expect(actualDate).to.eql(expectedDate);
        })
        .then(postRes =>
          supertest(app)
            .get(`/lists/${postRes.body.id}`)
            .expect(postRes.body)
        );
    });
    const requiredFields = ['title', 'userid'];

    requiredFields.forEach(field => {
      const newList = {
        title: 'Test new list',
        userid: '0'
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newList[field];

        return supertest(app)
          .post('/lists')
          .send(newList)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });

    describe('DELETE /lists/:list_id', () => {
      // in order to have all tests passing, first comment out the requireAuth from the routers
      context('Given no lists', () => {
        it('responds with 404', () => {
          const listId = 123456;
          return supertest(app)
            .delete(`/lists/${listId}`)
            .expect(404, { error: { message: 'List doesn\'t exist' } });
        });
      });
      context('Given there are lists in the database', () => {
        const testLists = makeListsArray();

        beforeEach('insert lists', () => {
          return db.into('grocery_lists').insert(testLists);
        });

        it('responds with 204 and removes the list', () => {
          const idToRemove = 2;
          const expectedLists = testLists.filter(
            list => list.id !== idToRemove
          );
          return supertest(app)
            .delete(`/lists/${idToRemove}`)
            .expect(204)
            .then(res =>
              supertest(app)
                .get('/lists')
                .expect(expectedLists)
            );
        });
      });
    });
  });
});
