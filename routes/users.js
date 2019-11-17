const usersRouter = require('express').Router();
const { getSingleUser } = require('../controllers/users');

usersRouter.get('/me', getSingleUser);

module.exports = usersRouter;
