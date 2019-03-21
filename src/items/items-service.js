'use strict';

const ItemsService = {
  getAllItems(knex) {
    return knex.select('*').from('grocery_items');
  },
  insertItem(knex, newItem) {
    return knex
      .insert(newItem)
      .into('grocery_items')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex
      .from('grocery_items')
      .select('*')
      .where('id', id)
      .first();
  },
  deleteItem(knex, id) {
    return knex('grocery_items')
      .where({ id })
      .delete();
  },
  updateItem(knex, id, newItemFields) {
    return knex('grocery_items')
      .where({ id })
      .update(newItemFields);
  }
};

module.exports = ItemsService;
