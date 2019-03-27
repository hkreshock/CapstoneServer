'use strict';

const xss = require('xss');
const express = require('express');
const ListsService = require('./lists-service');
const { requireAuth } = require('../middleware/basic-auth');

const jsonParser = express.json();
const ListsRouter = express.Router();

const serializeList = list => ({
  id: list.id,
  title: xss(list.title),
  userid: list.userid,
  date_created: list.date_created
});

ListsRouter.route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    ListsService.getAllLists(knexInstance)
      .then(lists => {
        res.json(lists.map(serializeList));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, userid } = req.body;
    const newList = { title, userid };

    for (const [key, value] of Object.entries(newList)) {
      // eslint-disable-next-line eqeqeq
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    ListsService.insertList(req.app.get('db'), newList)
      .then(list => {
        res
          .status(201)
          .location(`/lists/${list.id}`)
          .json({
            id: list.id,
            title: xss(list.title),
            userid: list.userid,
            date_created: list.date_created
          });
      })
      .catch(next);
  });

ListsRouter.route('/:list_id')
  .all(requireAuth)
  .all((req, res, next) => {
    ListsService.getById(req.app.get('db'), req.params.list_id)
      .then(list => {
        if (!list) {
          return res.status(404).json({
            error: { message: 'List doesn\'t exist' }
          });
        }
        res.list = list;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeList(res.list));
  })
  .delete((req, res, next) => {
    ListsService.deleteList(req.app.get('db'), req.params.list_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = ListsRouter;
