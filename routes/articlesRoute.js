const articlesRoute = require('express').Router();
const { handle405 } = require('../errorHandlers/errorHandlers');

const {
  getArticles,
  getArticleById,
  updateVote,
  deleteArticleById,
  getCommentsByArticleId,
  addComment,
  updateCommentVote,
  deleteCommentById,
} = require('../controllers/articles');


articlesRoute.route('/')
  .get(getArticles)
  .all(handle405);

articlesRoute.route('/:article_id')
  .get(getArticleById)
  .patch(updateVote)
  .delete(deleteArticleById)
  .all(handle405);

articlesRoute.route('/:article_id/comments')
  .get(getCommentsByArticleId)
  .post(addComment)
  .all(handle405);

articlesRoute.route('/:article_id/comments/:comment_id')
  .patch(updateCommentVote)
  .delete(deleteCommentById)
  .all(handle405);

module.exports = articlesRoute;
