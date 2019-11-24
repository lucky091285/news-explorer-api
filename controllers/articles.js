const Article = require('../models/article');
const NotFoundError = require('../errors/not-found-err');
const ServerError = require('../errors/server-err');

const { SERVER_ERROR, NOT_FOUND_ERROR_ARTICLE } = require('../errors/text-errors');

module.exports.createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  const owner = (req.user);

  Article.create({
    keyword, title, text, date, source, link, image, owner,
  })
    .then((article) => {
      if (!article) {
        throw new ServerError(SERVER_ERROR);
      }
      res.send({ data: article });
    })
    .catch(next);
};

module.exports.getAllArticles = (req, res, next) => {
  Article.find({})
    .populate('owner')
    .then((article) => {
      if (!article) {
        throw new ServerError(SERVER_ERROR);
      }
      res.send({ data: article });
    })
    .catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  Article.findById(req.params.id).select('+owner')
    // eslint-disable-next-line consistent-return
    .then((article) => {
      if (article === null) throw new NotFoundError(NOT_FOUND_ERROR_ARTICLE);
      if (!(JSON.stringify(article.owner) === JSON.stringify(req.user._id))) {
        const notArticleOwner = new Error(NOT_FOUND_ERROR_ARTICLE);
        notArticleOwner.statusCode = 403;
        throw notArticleOwner;
      }
      Article.deleteOne(article)
        .then(() => res.send(article))
        .catch(() => { throw new ServerError(SERVER_ERROR); });
    })
    .catch((err) => next(err.statusCode ? err : new NotFoundError(NOT_FOUND_ERROR_ARTICLE)));
};
