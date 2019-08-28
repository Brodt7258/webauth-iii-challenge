const knex = require('knex');
const config = require('../knexfile');

const db = knex(config.development);

module.exports = {
  getUsers,
  getUserById,
  addUser,
  getUserByName
};

function getUsers() {
  return db('users');
};

function getUserById(id) {
  return db('users')
    .where({ id })
    .first();
};

function addUser(user) {
  return db('users')
    .insert(user)
    .then(([ id ]) => {
      return getUserById(id);
    });
};

function getUserByName(username) {
  return db('users')
    .where({ username })
    .first();
};
