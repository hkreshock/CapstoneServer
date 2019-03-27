'use strict';

const xss = require('xss');
const express = require('express');
const path = require('path');
const UsersService = require('./users-service');
const { requireAuth } = require('../middleware/basic-auth');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

const serializeUser = user => ({
  id: user.id,
  user_name: xss(user.user_name),
  full_name: xss(user.full_name),
  email: xss(user.email),
  password: user.password,
  date_created: user.date_created
});

usersRouter.post('/', jsonBodyParser, (req, res, next) => {
  const { password, user_name, email, full_name } = req.body;

  for (const field of ['full_name', 'user_name', 'password'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      });
  const passwordError = UsersService.validatePassword(password);

  if (passwordError) return res.status(400).json({ error: passwordError });

  UsersService.hasUserWithUserName(req.app.get('db'), user_name)
    .then(hasUserWithUserName => {
      if (hasUserWithUserName)
        return res.status(400).json({ error: 'Username already taken' });

      return UsersService.hashPassword(password).then(hashedPassword => {
        const newUser = {
          user_name,
          password: hashedPassword,
          full_name,
          email
        };

        return UsersService.insertUser(req.app.get('db'), newUser).then(
          user => {
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${user.id}`))
              .json(UsersService.serializeUser(user));
          }
        );
      });
    })
    .catch(next);
});
usersRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    UsersService.getAllUsers(knexInstance)
      .then(users => {
        res.json(users.map(serializeUser));
      })
      .catch(next);
  });

module.exports = usersRouter;
