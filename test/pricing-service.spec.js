'use strict';

const PricingService = require('../src/pricing/pricing-service');
const knex = require('knex');

describe('Pricing service object', function() {
  let db;

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
  });
  describe('getAllPrices()', () => {
    it('resolves all items from \'grocery_items\' table', () => {});
  });
});
