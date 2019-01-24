const connection = require('../db/connection');
const { isValidSort } = require('../db/utils/index');

exports.getArticles = function (req, res, next) {
  const sort = isValidSort(req.query.sort_by);
  const {
    limit = 10,
    p = 1,
    sort_ascending = 'false',
  } = req.query;

  let sortOrder = 'desc';
  if (sort_ascending === 'true') sortOrder = 'asc';

  const numLimit = Number(limit) || '';
  const pNum = Number(p) || '';
  return connection
    .select('articles.article_id', 'topic', 'title', 'articles.created_at', 'articles.username as author', 'articles.votes')
    .count('comments.comment_id as comment_count')
    .from('articles')
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .orderBy(sort, sortOrder)
    .offset(numLimit * (pNum - 1))
    .limit(numLimit)
    .groupBy('articles.article_id')
    .then((articles) => {
      if (typeof numLimit !== 'number' || typeof pNum !== 'number') {
        return Promise.reject({
          status: 400,
          message: 'incorrect query type',
        });
      }
      if (!articles.length) {
        return Promise.reject({
          status: 404,
          message: 'article not found',
        });
      }
      return res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleById = function (req, res, next) {
  const { article_id } = req.params;
  return connection
    .select('articles.article_id', 'articles.body', 'topic', 'title', 'articles.created_at', 'articles.username as author', 'articles.votes')
    .count('comments.comment_id as comment_count')
    .from('articles')
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .where('articles.article_id', article_id)
    .groupBy('articles.article_id')
    .then(([article]) => {
      if (typeof idNum === 'string' || !article) {
        return Promise.reject({
          status: 404,
          message: 'article not found',
        });
      }
      return res.status(200).send({ article });
    })
    .catch(err => next(err));
};

exports.updateVote = function (req, res, next) {
  const { article_id } = req.params;
  const { votes = 0 } = { votes: req.body.inc_votes };
  let newVote;
  if (votes === '') {
    newVote = 0;
  } else {
    newVote = votes;
  }
  if (typeof newVote !== 'number') {
    res.status(400).send('invalid type');
  }
  return connection('articles')
    .where('articles.article_id', article_id)
    .increment('votes', newVote)
    .returning('*')
    .then(([article]) => {
      if (article === undefined) {
        return Promise.reject({
          status: 404,
          message: 'article not found',
        });
      }
      return res.status(200).send({ article });
    })
    .catch(err => next(err));
};

exports.deleteArticleById = function (req, res, next) {
  // return connection
  //   .select('*')
  //   .from('articles')
  //   .then((articles) => {
  //     const len = articles.length;
  //     return len;
  //   }).then((len) => {
  //     const { article_id } = req.params;
      return connection('articles')
        .where('articles.article_id', article_id)
        .del()
        .returning('*')
        .then((deleteCount) => {
          if (!deleteCount) {
            return Promise.reject({
              status: 404,
              message: 'article not found',
            });
          }
          return res.status(204).send({});
        })
        .catch(err => next(err));
    
};

exports.getCommentsByArticleId = function (req, res, next) {
  const {
    limit = 10, sort_by = 'comments.created_at',
    p = 1,
    sort_ascending = 'false',
  } = req.query;
  const { article_id } = req.params;
  const numLimit = Number(limit) || '';

  let sortOrder = 'desc';
  if (sort_ascending === 'true') sortOrder = 'asc';

  return connection
    .select('comment_id', 'votes', 'created_at', 'username as author', 'body')
    .from('comments')
    .where('comments.article_id', article_id)
    .limit(numLimit)
    .orderBy(sort_by, sortOrder)
    .offset(numLimit * (p - 1))
    .returning('*')
    .then((comments) => {
      if (typeof numLimit !== 'number') {
        return Promise.reject({
          status: 400,
          message: 'incorrect query type',
        });
      }
      if (!comments.length) {
        return Promise.reject({ status: 404, message: 'article not found' });
      }
      return res.status(200).send({ comments });
    })
    .catch(err => next(err));
};

exports.addComment = function (req, res, next) {
  const { article_id } = req.params;
  const inputObj = {
    username: req.body.username,
    body: req.body.body,
    article_id,
  };
  return connection('comments')
    .insert(inputObj)
    .returning('*')
    .then(([comment]) => {
      if (!comment) {
        return Promise.reject({ status: 404, message: 'article not found' });
      }
      return res.status(201).send({ comment });
    })
    .catch(err => next(err));
};

exports.updateCommentVote = function (req, res, next) {
  const { comment_id, article_id } = req.params;
  const votes = req.body.inc_votes;
  let newVote;
  if (votes === '') {
    newVote = 0;
  } else {
    newVote = votes;
  }
  if (typeof newVote !== 'number') {
    res.status(400).send('invalid type');
  }
  return connection
    .select('*')
    .from('comments')
    .then((comments) => {
      const len = comments.length;
      return len;
    })
    .then(len => connection('comments')
      .select('votes')
      .from('comments')
      .where('comments.comment_id', comment_id)
      .andWhere('comments.article_id', article_id)
      .increment('votes', newVote)
      .returning('*')
      .then(([comment]) => {
        if (len > article_id) {
          console.log('why isn;t this getting returned');
        }
        if (!comment) {
          return Promise.reject({
            status: 404,
            message: 'article not found',
          });
        }
        return res.status(200).send({ comment });
      })
      .catch((err) => {
        next(err);
      }));
};

exports.deleteCommentById = function (req, res, next) {
  return connection
    .select('*')
    .from('articles')
    .then((articles) => {
      const len = articles.length;
      return len;
    }).then((len) => {
      const { comment_id, article_id } = req.params;
      return connection('comments')
        .where('comments.comment_id', comment_id)
        .del()
        .returning('*')
        .then((comment) => {
          if (!comment.length) {
            return Promise.reject({
              status: 404,
              message: 'article not found',
            });
          }
          return res.status(204).send({});
        })
        .catch(err => next(err));
    });
};
