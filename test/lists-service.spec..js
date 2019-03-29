'use strict';

const ListsService = require('../src/lists/lists-service');
const knex = require('knex');

describe('Lists service object', function() {
  let db;

  let testLists = [
    {
      id: 1,
      title: 'list1',
      userid: 2,
      date_created: '2100-05-22T16:28:32.615Z'
    },
    {
      id: 2,
      title: 'list2',
      userid: 2,
      date_created: '2100-05-22T16:28:32.615Z'
    },
    {
      id: 3,
      title: 'list3',
      userid: 2,
      date_created: '2100-05-22T16:28:32.615Z'
    }
  ];

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
  });

  before(() => {
    () => db('grocery_lists').truncate();
  });

  afterEach(() => db('grocery_lists').truncate());

  after(() => db.destroy());

  context("Given 'grocery_lists' has data", () => {
    beforeEach(() => {
      return db.into('grocery_lists').insert(testLists);
    });

    it("getAllLists() resolves all lists from 'grocery_lists' table", () => {
      return ListsService.getAllLists(db).then(actual => {
        expect(actual).to.eql(testLists);
      });
    });
    it("getById() resolves an list by id from 'grocery_lists' table", () => {
      const thirdId = 3;
      const thirdTestList = testLists[thirdId - 1];
      return ListsService.getById(db, thirdId).then(actual => {
        expect(actual).to.eql({
          id: thirdId,
          title: thirdTestList.title,
          userid: thirdTestList.userid,
          date_created: thirdTestList.date_created
        });
      });
    });
    it("deleteList() removes an list by id from 'grocery_lists' table", () => {
      const listId = 3;
      return ListsService.deleteList(db, listId)
        .then(() => ListsService.getAllLists(db))
        .then(allLists => {
          const expected = testLists.filter(list => list.id !== listId);
          expect(allLists).to.eql(expected);
        });
    });
    it(`updateList() updates an list from the 'grocery_lists' table`, () => {
      const idOfListToUpdate = 3;
      const newListData = {
        id: 2,
        title: 'list2',
        userid: 2,
        date_created: new Date()
      };
      return ListsService.updateList(db, idOfListToUpdate, newListData)
        .then(() => ListsService.getById(db, idOfListToUpdate))
        .then(list => {
          expect(list).to.eql({
            id: idOfListToUpdate,
            ...newListData
          });
        });
    });
  });

  context("Given 'grocery_lists' has no data", () => {
    it('getAllLists() resolves an empty array', () => {
      return ListsService.getAllLists(db).then(actual => {
        expect(actual).to.eql([]);
      });
    });

    it("insertList() inserts a new list and resolves the new list with an 'id'", () => {
      const newList = {
        title: 'Test new title',
        userid: 2,
        date_created: new Date('2020-01-01T00:00:00.000Z')
      };
      return ListsService.insertList(db, newList).then(actual => {
        expect(actual).to.eql({
          id: 1,
          title: newList.title,
          userid: newList.userid,
          date_created: newList.date_created
        });
      });
    });
  });
});
