'use strict';

const xss = require('xss');
const express = require('express');
const ItemsService = require('./items-service');
const { requireAuth } = require('../middleware/basic-auth');

const jsonParser = express.json();
const ItemsRouter = express.Router();

const serializeItem = item => ({
  id: item.id,
  title: xss(item.title),
  quantity: xss(item.quantity),
  date_created: item.date_created,
  listid: item.listid
});

ItemsRouter.route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    ItemsService.getAllItems(knexInstance)
      .then(items => {
        res.json(items.map(serializeItem));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, quantity, listid } = req.body;
    const newItem = { title, quantity, listid };

    for (const [key, value] of Object.entries(newItem)) {
      // eslint-disable-next-line eqeqeq
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    ItemsService.insertItem(req.app.get('db'), newItem)
      .then(item => {
        res
          .status(201)
          .location(`/items/${item.id}`)
          .json({
            id: item.id,
            title: xss(item.title),
            quantity: xss(item.quantity),
            date_created: item.date_created,
            listId: item.listId
          });
      })
      .catch(next);
  });

ItemsRouter.route('/:item_id')
  .all(requireAuth)
  .all((req, res, next) => {
    ItemsService.getById(req.app.get('db'), req.params.item_id)
      .then(item => {
        if (!item) {
          return res.status(404).json({
            error: { message: 'Item doesn\'t exist' }
          });
        }
        res.item = item;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeItem(res.item));
  })
  .delete((req, res, next) => {
    ItemsService.deleteItem(req.app.get('db'), req.params.item_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = ItemsRouter;
