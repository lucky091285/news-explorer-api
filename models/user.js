const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('mongoose-type-email');

const { ERROR_EMAIL_OR_PASSWORD } = require('../errors/text-errors');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: mongoose.SchemaTypes.Email,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
});

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error(ERROR_EMAIL_OR_PASSWORD));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error(ERROR_EMAIL_OR_PASSWORD));
          }

          return user; // теперь user доступен
        });
    });
};

module.exports = mongoose.model('user', userSchema);
