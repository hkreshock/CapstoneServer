'use strict';

const ListsService = {
  getAllLists(knex) {
    return knex.select('*').from('grocery_lists');
  },
  insertList(knex, newList) {
    return knex
      .insert(newList)
      .into('grocery_lists')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex
      .from('grocery_lists')
      .select('*')
      .where('id', id)
      .first();
  },
  deleteList(knex, id) {
    return knex('grocery_lists')
      .where({ id })
      .delete();
  },
  updateList(knex, id, newListFields) {
    return knex('grocery_lists')
      .where({ id })
      .update(newListFields);
  }
};

module.exports = ListsService;
