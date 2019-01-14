const { formatArticle, formatComments } = require('../utils/index');
const {
  topicData, userData, articleData, commentData,
} = require('../data');

exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('topics').del()
    .then(() => knex('topics')
      .insert(topicData)
      .returning('*')).then(() => knex('users').del().then(() => knex('users')
      .insert(userData)
      .returning('*')))
    .then(() => {
      const formatted = formatArticle(articleData);
      return knex('articles')
        .insert(formatted)
        .returning(['article_id', 'title']);
    })
    .then((articleInfo) => {
      const formatted = formatComments(commentData, articleInfo);
      return knex('comments')
        .insert(formatted)
        .returning('*');
    });
};
