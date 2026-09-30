// Routes Messages realtime - psychiatre app
module.exports = app => {
    const router = require('express').Router();
    const db = require('../../database/db.config');
    const Message = db.messages;
    const BipolarUser = db.bipolarUsers;

    router.get('/bipolar/messages/:senderId/:receiverId', async (req, res) => {
        try {
            const { senderId, receiverId } = req.params;
            const messages = await Message.find({
                $or: [ { from: senderId, to: receiverId }, { from: receiverId, to: senderId } ]
            }).sort({ createdAt: 1 });
            res.json(messages.map(m => ({
                id: m._id,
                sender_id: m.from,
                receiver_id: m.to,
                fromName: m.fromName,
                message: m.message,
                lu: m.lu,
                created_at: m.createdAt
            })));
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    router.get('/bipolar/messages/conversations/:userId', async (req, res) => {
        try {
            const userId = req.params.userId;
            const messages = await Message.find({ $or: [{ from: userId }, { to: userId }] }).sort({ createdAt: -1 });
            const ids = [...new Set(messages.map(m => String(m.from) === String(userId) ? m.to : m.from))];
            const users = await BipolarUser.find({ _id: { $in: ids } }).select('fullname email role');
            res.json(users.map(u => ({ id: u._id, fullname: u.fullname, email: u.email, role: u.role })));
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    router.post('/bipolar/messages', async (req, res) => {
        try {
            const { sender_id, receiver_id, message, fromName } = req.body;
            if (!sender_id || !receiver_id || !message) return res.status(400).json({ message: 'sender_id, receiver_id and message are required' });
            const msg = new Message({ from: sender_id, to: receiver_id, fromName, message, lu: false });
            await msg.save();
            const payload = { id: msg._id, sender_id, receiver_id, fromName, message, created_at: msg.createdAt };
            global.io?.to(String(receiver_id)).emit('receive-message', payload);
            global.io?.to(String(sender_id)).emit('receive-message', payload);
            res.json({ success: true, message: payload });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    app.use('/api', router);
};
