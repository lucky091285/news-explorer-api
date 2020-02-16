const Article = require('../models/article');
const NotFoundError = require('../errors/not-found-err');
const ServerError = require('../errors/server-err');

const { SERVER_ERROR, NOT_FOUND_ERROR_ARTICLE } = require('../errors/text-errors');

module.exports.createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  const owner = req.user._id;

  Article.create({
    keyword, title, text, date, source, link, image, owner,
  })
    .then((article) => res.send(article))
    .catch((err) => next(new ServerError(`Ошибка при создании статьи -- ${err.message}`)));
};

module.exports.getAllArticles = (req, res, next) => {
  Article.find({ owner: req.user._id })
    .populate('owner')
    .then((articles) => res.send(articles))
    .catch(() => next(new ServerError('Ошибка при чтении всех статей')));
};

module.exports.deleteArticle = (req, res, next) => {
  Article.findById(req.params.id).select('+owner')
    // eslint-disable-next-line consistent-return
    .then((article) => {
      if (article === null) throw new NotFoundError(NOT_FOUND_ERROR_ARTICLE);
      if (!(JSON.stringify(article.owner) === JSON.stringify(req.user._id))) {
        const notArticleOwner = new ServerError(NOT_FOUND_ERROR_ARTICLE);
        notArticleOwner.statusCode = 403;
        throw notArticleOwner;
      }
      Article.deleteOne(article)
        .then(() => res.send(article))
        .catch(() => { throw new ServerError(SERVER_ERROR); });
    })
    .catch((err) => next(err.statusCode ? err : new NotFoundError(NOT_FOUND_ERROR_ARTICLE)));
};
