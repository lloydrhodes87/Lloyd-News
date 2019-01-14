const connection = require('../db/connection');

exports.getUsers = function (req, res, next) {
  return connection
    .select('*')
    .from('users')
    .then((users) => {
      if (!users.length) {
        return Promise.reject({ status: 404, message: 'article not found' });
      }
      return res.status(200).send({ users });
    }).catch(err => next(err));
};

exports.getUserByUsername = function (req, res, next) {
  const { username } = req.params;
  return connection
    .select('*')
    .from('users')
    .where('username', username)
    .then(([user]) => {
      if (!user) {
        return Promise.reject({
          status: 404,
          message: 'article not found',
        });
      }
      return res.status(200).send({ user });
    })
    .catch(err => next(err));
};
