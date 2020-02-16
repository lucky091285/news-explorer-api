/* eslint-disable no-unused-vars */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const AuthError = require('../errors/auth-err');
const ReqError = require('../errors/req-err');

const { NOT_AUTORIZED, REQ_ERROR } = require('../errors/text-errors');

const { DEV_SECRET_KEY } = require('./../config');

const { NODE_ENV, SECRET_KEY } = process.env;
require('dotenv').config();

// eslint-disable-next-line consistent-return
module.exports.createUser = (req, res, next) => {
  // eslint-disable-next-line no-console
  console.log(req.body);
  const {
    // eslint-disable-next-line no-unused-vars
    name, email, password,
  } = req.body;
  if (req.body.length !== 0) {
    bcrypt.hash(req.body.password, 10)
      .then((hash) => User.create({
        name, email, password: hash,
      }))
      .then((user) => res.status(201).send({
        _id: user._id, name: user.name, email: user.email,
      }))
      .catch(() => {
        const err = new ReqError(REQ_ERROR);
        err.statusCode = 400;
        next(err);
      });
  } else {
    return 'Заполните пожалуйста все поля';
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? SECRET_KEY : DEV_SECRET_KEY, { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({ message: 'авторизация прошла успешно' })
        .end();
    })
    .catch((err) => next(new AuthError(err.message)));
};

module.exports.logout = (req, res, next) => res
  .status(201)
  .cookie('jwt', '', {
    maxAge: 0,
    httpOnly: true,
    sameSite: false,
  }).send({ login: false });

module.exports.getSingleUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError(NOT_AUTORIZED);
      }
      res.send({ user: user.name, email: user.email });
    })
    .catch(next);
};
