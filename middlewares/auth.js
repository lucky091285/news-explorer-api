const jwt = require('jsonwebtoken');
require('dotenv').config();
const AuthError = require('../errors/auth-err');

const { NOT_AUTORIZED } = require('../errors/text-errors');

const { DEV_SECRET_KEY } = require('./../config');

const { NODE_ENV, SECRET_KEY } = process.env;

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  if (!req.cookies.jwt) {
    throw new AuthError(NOT_AUTORIZED);
  }
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? SECRET_KEY : DEV_SECRET_KEY);
  } catch (err) {
    throw new AuthError(NOT_AUTORIZED);
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};
