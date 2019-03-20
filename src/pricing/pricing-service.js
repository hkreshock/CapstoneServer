'use strict';
const xss = require('xss');

const PricingService = {
  getAllPrices() {
    return Promise.resolve('all the prices!!');
  }
};

module.exports = PricingService;
