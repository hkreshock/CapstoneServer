'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const ItemsRouter = require('./items/items-router');
const PricingRouter = require('./pricing/pricing-router');

const app = express();

app.use(
  morgan(NODE_ENV === 'production' ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test'
  })
);
app.use(cors());
app.use(helmet());

app.use('/items', ItemsRouter);

app.use('/api/items', ItemsRouter);
app.use('/api/pricing', PricingRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: 'Server error' };
  } else {
    // eslint-disable-next-line no-console
    console.error(error);
    response = { error: error.message, object: error };
  }
  res.status(500).json(response);

  next;
});

module.exports = app;