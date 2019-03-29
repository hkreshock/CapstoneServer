'use strict';

const knex = require('knex');
const app = require('../src/app');
const { makeUsersArray } = require('./users.fixtures');
const supertest = require('supertest');
const { expect } = require('chai');

describe('Users Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  before(() => {
    () => db('grocery_users').truncate();
  });

  afterEach('cleanup', () => db('grocery_users').truncate());

  after(() => db.destroy());

  describe('GET /users', () => {
    // in order to have all tests passing, first comment out the requireAuth from the routers
    context('Given no users', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/users')
          .expect(200, []);
      });
    });
    context('Given there are users in the database', () => {
      let testUsers = makeUsersArray();

      beforeEach('insert users', () => {
        return db.into('grocery_users').insert(testUsers);
      });

      it('GET /users responds with 200 and all of the users', () => {
        return supertest(app)
          .get('/users')
          .expect(200, testUsers);
      });
    });
  });

  describe('GET /users/:user_id', () => {
    // in order to have all tests passing, first comment out the requireAuth from the routers
    context('Given no users', () => {
      it('responds with 404', () => {
        const userId = 123456;
        return supertest(app)
          .get(`/users/${userId}`)
          .expect(404, { error: { message: 'User doesn\'t exist' } });
      });
    });
    context('Given there are users in the database', () => {
      context('Given an XSS attack user', () => {
        const maliciousUser = {
          user_name: 'malicious user',
          password: 'bad Password',
          full_name:
            'Naughty naughty very naughty <script>alert("xss");</script>',
          email:
            'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.'
        };

        beforeEach('insert malicious user', () => {
          return db.into('grocery_users').insert([maliciousUser]);
        }) +
          it('removes XSS attack content', () => {
            return supertest(app)
              .get(`/users/${maliciousUser.id}`)
              .expect(200)
              .expect(res => {
                expect(res.body.full_name).to.eql(
                  'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;'
                );
                expect(res.body.email).to.eql(
                  'Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.'
                );
              });
          });
      });
      let testUsers = makeUsersArray();

      beforeEach('insert users', () => {
        return db.into('grocery_users').insert(testUsers);
      });

      it('GET /user/:user_id responds with 200 and the specified user', () => {
        const userId = 2;
        const expectedUser = testUsers[userId - 1];
        return supertest(app)
          .get(`/users/${userId}`)
          .expect(200, expectedUser);
      });
    });
  });
  describe('POST /users', () => {
    // in order to have all tests passing, first comment out the requireAuth from the routers
    const newUser = {
      id: 1,
      user_name: 'user',
      password: 'new Password',
      full_name: 'Big Name',
      email: '123@yahoo.com'
    };
    it('creates an user, responding with 201 and the new user', function() {
      this.retries(3);
      return supertest(app)
        .post('/users')
        .send(newUser)
        .expect(201)
        .expect(res => {
          expect(res.body.user_name).to.eql(newUser.user_name);
          expect(res.body.password).to.eql(newUser.password);
          expect(res.body.full_name).to.eql(newUser.full_name);
          expect(res.body.email).to.eql(newUser.email);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/users/${res.body.id}`);
          const expectedDate = new Date().toLocaleString('en', {
            timeZone: 'America/Phoenix'
          });
          const actualDate = new Date(res.body.date_created).toLocaleString();
          expect(actualDate).to.eql(expectedDate);
        })
        .then(postRes =>
          supertest(app)
            .get(`/users/${postRes.body.id}`)
            .expect(postRes.body)
        );
    });
    const requiredFields = ['user_name', 'password', 'full_name', 'email'];

    requiredFields.forEach(field => {
      const newUser = {
        id: 1,
        user_name: 'user',
        password: 'new Password',
        full_name: 'Big Name',
        email: '123@yahoo.com'
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newUser[field];

        return supertest(app)
          .post('/users')
          .send(newUser)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });

    describe('DELETE /users/:user_id', () => {
      // in order to have all tests passing, first comment out the requireAuth from the routers
      context('Given no users', () => {
        it('responds with 404', () => {
          const userId = 123456;
          return supertest(app)
            .delete(`/users/${userId}`)
            .expect(404, { error: { message: 'User doesn\'t exist' } });
        });
      });
      context('Given there are users in the database', () => {
        const testUsers = makeUsersArray();

        beforeEach('insert users', () => {
          return db.into('grocery_users').insert(testUsers);
        });

        it('responds with 204 and removes the user', () => {
          const idToRemove = 2;
          const expectedUsers = testUsers.filter(
            user => user.id !== idToRemove
          );
          return supertest(app)
            .delete(`/users/${idToRemove}`)
            .expect(204)
            .then(res =>
              supertest(app)
                .get('/users')
                .expect(expectedUsers)
            );
        });
      });
    });
  });
});
