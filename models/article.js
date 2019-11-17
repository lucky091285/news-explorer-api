const mongoose = require('mongoose');
require('mongoose-type-url');

const articleSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
    minlength: 2,
  },
  title: {
    type: String,
    required: true,
    minlength: 2,
  },
  text: {
    type: String,
    required: true,
    minlength: 2,
  },
  date: {
    type: String,
    required: true,
    minlength: 2,
  },
  source: {
    type: String,
    required: true,
    minlength: 2,
  },
  link: {
    type: mongoose.SchemaTypes.Url,
    required: true,
  },
  image: {
    type: mongoose.SchemaTypes.Url,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: [],
  },
});

module.exports = mongoose.model('article', articleSchema);
