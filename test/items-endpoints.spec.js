'use strict';

const knex = require('knex');
const app = require('../src/app');
const { makeItemsArray } = require('./items.fixtures');
const supertest = require('supertest');
const { expect } = require('chai');

describe('Items Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  before(() => {
    () => db('grocery_items').truncate();
  });

  afterEach('cleanup', () => db('grocery_items').truncate());

  after(() => db.destroy());

  describe('GET /items', () => {
    // in order to have all tests passing, first comment out the requireAuth from the routers
    context('Given no items', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/items')
          .expect(200, []);
      });
    });
    context('Given there are items in the database', () => {
      let testItems = makeItemsArray();

      beforeEach('insert items', () => {
        return db.into('grocery_items').insert(testItems);
      });

      it('GET /items responds with 200 and all of the items', () => {
        return supertest(app)
          .get('/items')
          .expect(200, testItems);
      });
    });
  });

  describe('GET /items/:item_id', () => {
    // in order to have all tests passing, first comment out the requireAuth from the routers
    context('Given no items', () => {
      it('responds with 404', () => {
        const itemId = 123456;
        return supertest(app)
          .get(`/items/${itemId}`)
          .expect(404, { error: { message: 'Item doesn\'t exist' } });
      });
    });
    context('Given there are items in the database', () => {
      context('Given an XSS attack item', () => {
        const maliciousItem = {
          id: 911,
          title: 'Naughty naughty very naughty <script>alert("xss");</script>',
          quantity:
            'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.'
        };

        beforeEach('insert malicious item', () => {
          return db.into('grocery_items').insert([maliciousItem]);
        }) +
          it('removes XSS attack content', () => {
            return supertest(app)
              .get(`/items/${maliciousItem.id}`)
              .expect(200)
              .expect(res => {
                expect(res.body.title).to.eql(
                  'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;'
                );
                expect(res.body.quantity).to.eql(
                  'Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.'
                );
              });
          });
      });
      let testItems = makeItemsArray();

      beforeEach('insert items', () => {
        return db.into('grocery_items').insert(testItems);
      });

      it('GET /item/:item_id responds with 200 and the specified item', () => {
        const itemId = 2;
        const expectedItem = testItems[itemId - 1];
        return supertest(app)
          .get(`/items/${itemId}`)
          .expect(200, expectedItem);
      });
    });
  });
  describe('POST /items', () => {
    // in order to have all tests passing, first comment out the requireAuth from the routers
    const newItem = {
      title: 'Test new item',
      quantity: '0',
      listid: '0'
    };
    it('creates an item, responding with 201 and the new item', function() {
      this.retries(3);
      return supertest(app)
        .post('/items')
        .send(newItem)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newItem.title);
          expect(res.body.quantity).to.eql(newItem.quantity);
          expect(res.body.listid).to.eql(newItem.listid);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/items/${res.body.id}`);
          const expectedDate = new Date().toLocaleString('en', {
            timeZone: 'America/Phoenix'
          });
          const actualDate = new Date(res.body.date_created).toLocaleString();
          expect(actualDate).to.eql(expectedDate);
        })
        .then(postRes =>
          supertest(app)
            .get(`/items/${postRes.body.id}`)
            .expect(postRes.body)
        );
    });
    const requiredFields = ['title', 'quantity'];

    requiredFields.forEach(field => {
      const newItem = {
        title: 'Test new item',
        quantity: '0'
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newItem[field];

        return supertest(app)
          .post('/items')
          .send(newItem)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });

    describe('DELETE /items/:item_id', () => {
      // in order to have all tests passing, first comment out the requireAuth from the routers
      context('Given no items', () => {
        it('responds with 404', () => {
          const itemId = 123456;
          return supertest(app)
            .delete(`/items/${itemId}`)
            .expect(404, { error: { message: 'Item doesn\'t exist' } });
        });
      });
      context('Given there are items in the database', () => {
        const testItems = makeItemsArray();

        beforeEach('insert items', () => {
          return db.into('grocery_items').insert(testItems);
        });

        it('responds with 204 and removes the item', () => {
          const idToRemove = 2;
          const expectedItems = testItems.filter(
            item => item.id !== idToRemove
          );
          return supertest(app)
            .delete(`/items/${idToRemove}`)
            .expect(204)
            .then(res =>
              supertest(app)
                .get('/items')
                .expect(expectedItems)
            );
        });
      });
    });
  });
});
