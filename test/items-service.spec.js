'use strict';

const ItemsService = require('../src/items/items-service');
const knex = require('knex');

describe('Items service object', function() {
  let db;

  let testItems = [
    {
      id: 1,
      date_created: new Date('1919-12-22T16:28:32.615Z'),
      title: 'Lemons',
      quantity: '2'
    },
    {
      id: 2,
      date_created: new Date('1919-12-22T16:28:32.615Z'),
      title: 'Juice Boxes',
      quantity: '12'
    },
    {
      id: 3,
      date_created: new Date('1919-12-22T16:28:32.615Z'),
      title: 'Cereal Box',
      quantity: '1'
    }
  ];

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
  });

  before(() => {
    () => db('grocery_items').truncate();
  });

  afterEach(() => db('grocery_items').truncate());

  after(() => db.destroy());

  context("Given 'grocery_items' has data", () => {
    beforeEach(() => {
      return db.into('grocery_items').insert(testItems);
    });

    it("getAllItems() resolves all items from 'grocery_items' table", () => {
      return ItemsService.getAllItems(db).then(actual => {
        expect(actual).to.eql(testItems);
      });
    });
    it("getById() resolves an item by id from 'grocery_items' table", () => {
      const thirdId = 3;
      const thirdTestItem = testItems[thirdId - 1];
      return ItemsService.getById(db, thirdId).then(actual => {
        expect(actual).to.eql({
          id: thirdId,
          title: thirdTestItem.title,
          quantity: thirdTestItem.quantity,
          date_created: thirdTestItem.date_created
        });
      });
    });
    it("deleteItem() removes an item by id from 'grocery_items' table", () => {
      const itemId = 3;
      return ItemsService.deleteItem(db, itemId)
        .then(() => ItemsService.getAllItems(db))
        .then(allItems => {
          const expected = testItems.filter(item => item.id !== itemId);
          expect(allItems).to.eql(expected);
        });
    });
    it(`updateItem() updates an item from the 'grocery_items' table`, () => {
      const idOfItemToUpdate = 3;
      const newItemData = {
        title: 'updated title',
        quantity: '0',
        date_created: new Date()
      };
      return ItemsService.updateItem(db, idOfItemToUpdate, newItemData)
        .then(() => ItemsService.getById(db, idOfItemToUpdate))
        .then(item => {
          expect(item).to.eql({
            id: idOfItemToUpdate,
            ...newItemData
          });
        });
    });
  });

  context("Given 'grocery_items' has no data", () => {
    it('getAllItems() resolves an empty array', () => {
      return ItemsService.getAllItems(db).then(actual => {
        expect(actual).to.eql([]);
      });
    });

    it("insertItem() inserts a new item and resolves the new item with an 'id'", () => {
      const newItem = {
        title: 'Test new title',
        quantity: '0',
        date_created: new Date('2020-01-01T00:00:00.000Z')
      };
      return ItemsService.insertItem(db, newItem).then(actual => {
        expect(actual).to.eql({
          id: 1,
          title: newItem.title,
          quantity: newItem.quantity,
          date_created: newItem.date_created
        });
      });
    });
  });
});
