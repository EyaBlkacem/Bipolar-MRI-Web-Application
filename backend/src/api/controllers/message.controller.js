const db = require('../../database/db.config');
const Message = db.messages;

exports.getConversation = (req, res) => {
    const { userId1, userId2 } = req.params;

    Message.find({
        $or: [
            { from: userId1, to: userId2 },
            { from: userId2, to: userId1 }
        ]
    })
    .sort({ createdAt: 1 })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};


exports.markAsRead = (req, res) => {
    const { from, to } = req.params;

    Message.updateMany(
        { from, to, lu: false },
        { lu: true }
    )
    .then(() => res.send({ message: 'Messages lus' }))
    .catch(err => res.status(500).send({ message: err.message }));
};


exports.getUnread = (req, res) => {
    const { userId } = req.params;

    Message.countDocuments({ to: userId, lu: false })
        .then(count => res.send({ count }))
        .catch(err => res.status(500).send({ message: err.message }));
};