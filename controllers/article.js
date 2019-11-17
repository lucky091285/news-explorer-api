const Article = require('../models/article');
const NotFoundError = require('../errors/not-found-err');
const ServerError = require('../errors/server-err');

module.exports.createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  const owner = (req.user._id);

  Article.create({
    keyword, title, text, date, source, link, image, owner,
  })
    .then((article) => {
      if (!article) {
        throw new ServerError('Ошибка запроса');
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
        throw new ServerError('Произошла ошибка при загрузке статей');
      }
      res.send({ data: article });
    })
    .catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  Article.findById(req.params.id).select('+owner')
    // eslint-disable-next-line consistent-return
    .then((article) => {
      if (article === null) {
        throw new NotFoundError('Такой статьи нет');
      }
      if (!(JSON.stringify(article.owner) === JSON.stringify(req.user._id))) {
        throw new ServerError('Удалять можно только свои статьи!');
      }
      Article.findByIdAndRemove(req.params.id).select('+owner')
        // eslint-disable-next-line no-shadow
        .then((article) => res.send({ data: article }))
        .catch(next);
    })
    .catch(next);
};
