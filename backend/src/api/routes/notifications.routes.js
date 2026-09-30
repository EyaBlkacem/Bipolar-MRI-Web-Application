module.exports = app => {

    const notifications =
    require('../controllers/notifications.controller');

    const router =
    require('express').Router();

    router.get(
        '/',
        notifications.findAll
    );

    router.put(
        '/:id/read',
        notifications.markAsRead
    );

    app.use(
        '/api/notifications',
        router
    );

};