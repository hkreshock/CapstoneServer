'use strict';

function makeUsersArray() {
  return [
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
}

module.exports = {
  makeUsersArray
};
