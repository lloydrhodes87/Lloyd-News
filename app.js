

const express = require('express');
const bodyParser = require('body-parser');

const {
  handle400,
  handle404,
  handle422,
  handle204,
} = require('./errorHandlers/errorHandlers');
const apiRouter = require('./routes/apiRoute');


const app = express();

app.use(bodyParser.json());

app.use('/api', apiRouter);


app.use(handle404);
app.use(handle422);
app.use(handle400);
app.use(handle204);


module.exports = app;
