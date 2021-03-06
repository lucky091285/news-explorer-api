require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cors = require('cors');
const { celebrate, Joi, errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const usersRoutes = require('./routes/users');
const auth = require('./middlewares/auth');
const { createUser, login, logout } = require('./controllers/users');
const articlesRoutes = require('./routes/articles');

const {
  PORT = 3000,
  MONGO_SERVER = 'mongodb://localhost:27017/new_site',
} = process.env;

const app = express();
app.use(cors(({
  credentials: true,
  origin: true,
})));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

mongoose.connect(MONGO_SERVER, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());
app.use(helmet());
app.use(limiter);

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
  }),
}), createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
  }),
}), login);

app.post('/logout', logout);

app.use(auth);

app.use('/users', usersRoutes);
app.use('/articles', articlesRoutes);

app.use(errorLogger);

app.use(errors()); // обработчик ошибок celebrate

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});

app.listen(PORT);
