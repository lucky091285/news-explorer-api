const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ReqError = require('../errors/req-err');
const AuthError = require('../errors/auth-err');

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
      .then((user) => {
        if (!user) {
          throw new ReqError('Ошибка запроса');
        }
        res.send({ data: user });
      })
      .catch(next);
  } else {
    return 'Заполните пожалуйста все поля';
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new AuthError('Ошибка авторизации');
      }
      const token = jwt.sign({ _id: user._id }, process.env.NODE_ENV === 'production' ? process.env.SECRET_KEY : 'secret_key', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({ message: 'авторизация прошла успешно' })
        .end();
    })
    .catch(next);
};

module.exports.getSingleUser = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      res.send({ data: user });
    })
    .catch(next);
};
