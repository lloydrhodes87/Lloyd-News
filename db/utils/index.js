const { articleData } = require('../data/index');
const topicD = require('../data/test-data/topics');

function timeConverter(UNIX_timestamp) {
  return new Date(UNIX_timestamp);
}

exports.formatArticle = function () {
  return articleData
    .map(({ created_by, created_at, ...remainingArticleData }) => (
      {
        username: created_by,
        created_at: timeConverter(created_at),
        ...remainingArticleData,
      }));
};

exports.formatComments = function (comments, articles) {
  return comments.map(({
    belongs_to, created_by, created_at, ...remainingComments
  }) => {
    const filteredArticle = articles.filter(article => article.title === belongs_to);
    return {
      username: created_by,
      article_id: filteredArticle[0].article_id,
      created_at: timeConverter(created_at),
      ...remainingComments,
    };
  });
};

exports.arrayOfSlugs = function () {
  return topicD.map(element => element.slug);
};

exports.isValidSort = function (query) {
  let sortBy;
  const columnArray = ['article_id', 'topic', 'title', 'created_at', 'author', 'votes', 'comment_count'];
  if (columnArray.includes(query)) {
    sortBy = query;
  } else {
    sortBy = 'created_at';
  }
  return sortBy;
};
