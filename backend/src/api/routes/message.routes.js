module.exports = app => {
    const router = require('express').Router();
    const msgController = require('../controllers/message.controller');

    router.get('/messages/:userId1/:userId2', msgController.getConversation);
    router.put('/messages/read/:from/:to',   msgController.markAsRead);
    router.get('/messages/unread/:userId',   msgController.getUnread);

    app.use('/api', router);
};