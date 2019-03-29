'use strict';

const UsersService = require('../src/users/users-service');
const knex = require('knex');

describe('Users service object', function() {
  let db;

  let testUsers = [
    {
      id: 1,
      user_name: 'user',
      password: 'new Password',
      full_name: 'Big Name',
      email: '123@yahoo.com'
    },
    {
      id: 2,
      user_name: 'user1',
      password: 'new Password1',
      full_name: 'Big Name1',
      email: '1234@yahoo.com'
    },
    {
      id: 3,
      user_name: 'user2',
      password: 'new Password2',
      full_name: 'Big Name2',
      email: '12345@yahoo.com'
    }
  ];

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
  });

  before(() => {
    () => db('grocery_users').truncate();
  });

  afterEach(() => db('grocery_users').truncate());

  after(() => db.destroy());

  context("Given 'grocery_users' has data", () => {
    beforeEach(() => {
      return db.into('grocery_users').insert(testUsers);
    });

    it("getAllUsers() resolves all users from 'grocery_users' table", () => {
      return UsersService.getAllUsers(db).then(actual => {
        expect(actual).to.eql(testUsers);
      });
    });
    it("getById() resolves an user by id from 'grocery_users' table", () => {
      const thirdId = 3;
      const thirdTestUser = testUsers[thirdId - 1];
      return UsersService.getById(db, thirdId).then(actual => {
        expect(actual).to.eql({
          id: thirdId,
          user_name: thirdTestUser.user_name,
          password: thirdTestUser.password,
          full_name: thirdTestUser.full_name,
          email: thirdTestUser.email
        });
      });
    });
    it("deleteUser() removes an user by id from 'grocery_users' table", () => {
      const userId = 3;
      return UsersService.deleteUser(db, userId)
        .then(() => UsersService.getAllUsers(db))
        .then(allUsers => {
          const expected = testUsers.filter(user => user.id !== userId);
          expect(allUsers).to.eql(expected);
        });
    });
    it(`updateUser() updates an user from the 'grocery_users' table`, () => {
      const idOfUserToUpdate = 3;
      const newUserData = {
        title: 'updated title',
        quantity: '0',
        date_created: new Date()
      };
      return UsersService.updateUser(db, idOfUserToUpdate, newUserData)
        .then(() => UsersService.getById(db, idOfUserToUpdate))
        .then(user => {
          expect(user).to.eql({
            id: idOfUserToUpdate,
            ...newUserData
          });
        });
    });
  });

  context("Given 'grocery_users' has no data", () => {
    it('getAllUsers() resolves an empty array', () => {
      return UsersService.getAllUsers(db).then(actual => {
        expect(actual).to.eql([]);
      });
    });

    it("insertUser() inserts a new user and resolves the new user with an 'id'", () => {
      const newUser = {
        user_name: 'user',
        password: 'new Password',
        full_name: 'Big Name',
        email: '123@yahoo.com'
      };
      return UsersService.insertUser(db, newUser).then(actual => {
        expect(actual).to.eql({
          id: 1,
          user_name: newUser.user_name,
          password: newUser.password,
          full_name: newUser.full_name,
          email: newUser.email
        });
      });
    });
  });
});
