const topicsRoute = require('express').Router();
const {
  getTopics, addTopic, getArticleByTopic, postArticleByTopic,
} = require('../controllers/topics');
const { handle405 } = require('../errorHandlers/errorHandlers');

topicsRoute.route('/')
  .get(getTopics)
  .post(addTopic)
  .all(handle405);

topicsRoute.route('/:topic/articles')
  .get(getArticleByTopic)
  .post(postArticleByTopic)
  .all(handle405);


module.exports = topicsRoute;
