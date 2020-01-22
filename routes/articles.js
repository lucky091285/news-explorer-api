const articlesRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { createArticle, getAllArticles, deleteArticle } = require('../controllers/articles');

articlesRouter.get('/', getAllArticles);

articlesRouter.post('/', celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required().min(2),
    title: Joi.string().required().min(2),
    text: Joi.string().required().min(2),
    date: Joi.string().required().min(2),
    source: Joi.string().required().min(2),
    link: Joi.string().required().uri(),
    image: Joi.string().required().uri(),
  }),
}), createArticle);

articlesRouter.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum(),
  }),
}), deleteArticle);

module.exports = articlesRouter;
