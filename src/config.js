'use strict';

module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL:
    process.env.DATABASE_URL ||
    'postgresql://hunterkreshock@localhost/grocery_auth',
  TEST_DB_URL:
    process.env.TEST_DB_URL ||
    'postgresql://hunterkreshock@localhost/grocery_auth_test',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '3h'
};
