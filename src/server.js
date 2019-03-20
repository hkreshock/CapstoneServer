'use strict';

require('dotenv').config();
const knex = require('knex');
const app = require('./app');
const { PORT, DB_URL } = require('./config');
const ItemsService = require('./items/items-service');

const db = knex({
  client: 'pg',
  connection: DB_URL
});

ItemsService.getAllItems(db)
  .then(() =>
    ItemsService.insertItem(db, {
      id: 11,
      title: 'New title',
      quantity: '0',
      date_created: new Date()
    })
  )
  .then(newItem => {
    return ItemsService.updateItem(db, newItem.id, {
      title: 'Updated title'
    }).then(() => ItemsService.getById(db, newItem.id));
  })
  .then(item => {
    return ItemsService.deleteItem(db, item.id);
  });

app.set('db', db);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening at http://localhost:${PORT}`);
});
