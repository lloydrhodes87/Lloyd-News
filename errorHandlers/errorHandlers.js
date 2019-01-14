
exports.handle404 = (err, req, res, next) => {
  if (err.status === 404) {
    return res.status(404).send({ message: 'article not found' });
  }
  if (err.detail === 'Key (topic)=(unknown) is not present in table "topics".') {
    return res.status(404).send({ message: 'topic does not exist' });
  } if (err.code === '22P02') {
    return res.status(404).send({ message: 'topic does not exist' });
  } return next(err);
};

exports.handle422 = (err, req, res, next) => {
  const codes = {
    23503: 'Article_id does not exist',
    23505: 'Unprocessable entity',
  };
  if (codes[err.code]) res.status(422).send({ msg: 'bad request' });
  else next(err);
};


exports.handle400 = (err, req, res, next) => {
  const codes = {
    // '22P02': 'Invalid Text',
    42703: 'Incorrect data inputted',
    '2201X': 'Client has used none integer value for page query',
  };
  if (codes[err.code]) res.status(400).send({ msg: 'bad request' });
  else next(err);
};

exports.handle204 = (err, req, res, next) => {
  if (err.status === 204) {
    return res.status(204).send({ message: 'no content' });
  }
  return next(err);
};

exports.handle405 = (req, res, next) => {
  res.status(405).send({ message: 'method not allowed' });
};
