'use strict';

function makeItemsArray() {
  return [
    {
      id: 1,
      date_created: '2029-01-22T16:28:32.615Z',
      title: 'Lemons',
      quantity: '2'
    },
    {
      id: 2,
      date_created: '2100-05-22T16:28:32.615Z',
      title: 'Juice Boxes',
      quantity: '12'
    },
    {
      id: 3,
      date_created: '2100-05-22T16:28:32.615Z',
      title: 'Cereal Box',
      quantity: '1'
    }
  ];
}

module.exports = {
  makeItemsArray
};
