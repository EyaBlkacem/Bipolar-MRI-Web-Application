// Routes Stats - converti MySQL -> MongoDB
module.exports = app => {
    const router = require('express').Router();
    const db = require('../../database/db.config');

    router.get('/stats', async (req, res) => {
        try {
            const patients = await db.bipolarUsers.countDocuments({ role: 'user' });
            const assessments = await db.assessments.countDocuments();
            const reports = await db.reports.countDocuments();
            const appointments = await db.appointments.countDocuments({ status: 'pending' });
            const unreadMessages = await db.messages.countDocuments({ lu: false });

            res.json({ patients, assessments, reports, appointments, unreadMessages });
        } catch (error) {
            console.error('Stats error:', error);
            res.status(500).json({ message: 'Erreur serveur statistiques' });
        }
    });

    app.use('/api', router);
};
