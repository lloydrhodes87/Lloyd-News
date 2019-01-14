const usersRoute = require('express').Router();
const { handle405 } = require('../errorHandlers/errorHandlers');

const { getUsers, getUserByUsername } = require('../controllers/users');


usersRoute.route('/')
  .get(getUsers)
  .all(handle405);

usersRoute.route('/:username')
  .get(getUserByUsername)
  .all(handle405);


module.exports = usersRoute;
