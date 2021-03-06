/* eslint-disable no-console */
'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const ItemsRouter = require('./items/items-router');
const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');
const listsRouter = require('./lists/lists-router');

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
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/lists', listsRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: 'Server error' };
  } else {
    console.error(error);
    response = { error };
  }
  res.status(500).json(response);

  next;
});

module.exports = app;
