'use strict';

const xss = require('xss');
const bcrypt = require('bcryptjs');

// eslint-disable-next-line no-useless-escape
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
  getAllUsers(knex) {
    return knex.select('*').from('grocery_users');
  },
  hasUserWithUserName(db, user_name) {
    return db('grocery_users')
      .where({ user_name })
      .first()
      .then(user => {
        return !!user;
      });
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('grocery_users')
      .returning('*')
      .then(([user]) => user);
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeUser(user) {
    return {
      id: user.id,
      full_name: xss(user.full_name),
      user_name: xss(user.user_name),
      date_created: user.date_created
    };
  }
};

module.exports = UsersService;
