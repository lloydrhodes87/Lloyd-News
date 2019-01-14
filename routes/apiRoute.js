const apiRouter = require('express').Router();
const topicsRoute = require('./topicsRoute');
const articlesRoute = require('./articlesRoute');
const usersRoute = require('./usersRoute');

const jsonFile = require('../endpoints.json');

apiRouter.use('/topics', topicsRoute);
apiRouter.use('/articles', articlesRoute);
apiRouter.use('/users', usersRoute);

apiRouter.get('/', (req, res, next) => {
  res.send(jsonFile);
});

module.exports = apiRouter;
