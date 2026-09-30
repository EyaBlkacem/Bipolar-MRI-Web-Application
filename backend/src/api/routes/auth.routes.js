module.exports = app => {
    const router = require('express').Router();
    const authController = require('../controllers/auth.controller');

    router.post('/auth/register',   authController.register);
    router.post('/auth/login',      authController.login);
    router.get('/auth/users',       authController.findAll);
    router.put('/auth/users/:id',   authController.updateUser);

    app.use('/api', router);
};