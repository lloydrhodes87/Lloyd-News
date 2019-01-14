const connection = require('../db/connection');
const { isValidSort } = require('../db/utils/index');
const { articleData } = require('../db/data/index');

exports.getTopics = function (req, res, next) {
  return connection
    .select('*')
    .from('topics')
    .then(((topics) => {
      if (!topics.length) return Promise.reject({ status: 404, message: 'article not found' });
      return res.status(200).send({ topics });
    }))
    .catch(err => next(err));
};

exports.addTopic = function (req, res, next) {
  let isString = true;
  Object.values(req.body).forEach((val) => {
    if (typeof val !== 'string') {
      isString = false;
    }
  });
  if (!isString) {
    return res.status(400).send('malformed syntax');
  }
  return connection('topics')
    .insert(req.body)
    .returning('*')
    .then(([topic]) => {
      if (!topic) {
        return Promise.reject({
          status: 404,
          message: 'article not found',
        });
      }
      return res.status(201).send({ topic });
    })
    .catch(err => next(err));
};

exports.getArticleByTopic = function (req, res, next) {
  const sort = isValidSort(req.query.sort_by);
  const { topic } = req.params;
  const {
    limit = 10,
    p = 1,
    sort_ascending = 'false',
  } = req.query;
  let sortOrder = 'desc';
  if (sort_ascending === 'true') sortOrder = 'asc';
  const numLimit = Number(limit) || '';
  return connection
    .select('articles.article_id',
      'topic',
      'title',
      'articles.created_at',
      'articles.username as author',
      'articles.votes')
    .count('comments.comment_id as comment_count')
    .from('articles')
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .where({ topic })
    .limit(numLimit)
    .orderBy(sort, sortOrder)
    .offset(numLimit * (p - 1))
    .groupBy('articles.article_id')
    .then((articles) => {
      if (typeof numLimit !== 'number') return Promise.reject({ status: 400, message: 'incorrect query type' });
      if (!articles.length || numLimit > articleData.length) return Promise.reject({ status: 404, message: 'article not found' });
      return res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticleByTopic = function (req, res, next) {
  const { topic } = req.params;
  const { title, username, body } = req.body;
  return connection('articles')
    .insert({
      title,
      topic,
      body,
      username,
    })
    .returning('*')
    .then(([article]) => {
      if (!article) return Promise.reject({ status: 404, message: 'article not found' });
      return res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
