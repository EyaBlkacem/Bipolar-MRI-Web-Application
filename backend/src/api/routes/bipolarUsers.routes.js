// Routes Users/Patients pour l'app Psychiatre (binôme) - converti MySQL -> MongoDB
module.exports = app => {
    const router = require('express').Router();
    const db = require('../../database/db.config');
    const BipolarUser = db.bipolarUsers;
    const Appointment = db.appointments;

    /* =========================================
       GET ALL PATIENTS (role = user)
    ========================================= */
    router.get('/users', async (req, res) => {
        try {
            const search = req.query.search || '';
            const condition = { role: 'user' };

            if (search) {
                condition.$or = [
                    { fullname: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            const users = await BipolarUser.find(condition).sort({ createdAt: -1 });

            // Enrichir avec les stats de rendez-vous
            const enriched = await Promise.all(users.map(async u => {
                const appts = await Appointment.find({ patient_id: u._id });
                const lastVisit = appts.length > 0
                    ? appts.sort((a, b) => b.appointment_date - a.appointment_date)[0].appointment_date
                    : null;
                return {
                    id: u._id,
                    fullname: u.fullname,
                    email: u.email,
                    phone: u.phone,
                    lastVisit,
                    visits_count: appts.length,
                    created_at: u.createdAt
                };
            }));

            res.json(enriched);
        } catch (error) {
            console.error('GET users error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    });

    /* =========================================
       GET RECENT USERS
    ========================================= */
    router.get('/users/recent', async (req, res) => {
        try {
            const users = await BipolarUser.find({ role: 'user' })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('fullname email createdAt');
            res.json(users.map(u => ({ id: u._id, fullname: u.fullname, email: u.email, created_at: u.createdAt })));
        } catch (error) {
            console.error('GET recent users error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    });

    /* =========================================
       CHAT USERS
    ========================================= */
    router.get('/users/chat-users', async (req, res) => {
        try {
            const users = await BipolarUser.find({ role: 'user' })
                .sort({ fullname: 1 })
                .select('fullname email role');
            res.json(users.map(u => ({ id: u._id, fullname: u.fullname, email: u.email, role: u.role })));
        } catch (error) {
            console.error('GET chat users error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    });

    /* =========================================
       GET USER BY ID
    ========================================= */
    router.get('/users/:id', async (req, res) => {
        try {
            const u = await BipolarUser.findOne({ _id: req.params.id, role: 'user' });
            if (!u) return res.status(404).json({ message: 'Patient not found' });

            const appts = await Appointment.find({ patient_id: u._id });
            const lastVisit = appts.length > 0
                ? appts.sort((a, b) => b.appointment_date - a.appointment_date)[0].appointment_date
                : null;

            res.json({
                id: u._id,
                fullname: u.fullname,
                email: u.email,
                phone: u.phone,
                lastVisit,
                visits_count: appts.length,
                created_at: u.createdAt
            });
        } catch (error) {
            console.error('GET user details error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    });

    /* =========================================
       ADD USER
    ========================================= */
    router.post('/users', async (req, res) => {
        try {
            const { fullname, email, password, phone } = req.body;
            const bcrypt = require('bcryptjs');
            const hashed = await bcrypt.hash(password || '123456', 10);
            const newUser = new BipolarUser({ fullname, email, password: hashed, phone: phone || null, role: 'user' });
            await newUser.save();
            res.json({ message: 'Patient added successfully' });
        } catch (error) {
            console.error('POST user error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    });

    /* =========================================
       UPDATE USER
    ========================================= */
    router.put('/users/:id', async (req, res) => {
        try {
            const { fullname, email, phone } = req.body;
            await BipolarUser.findByIdAndUpdate(req.params.id, { fullname, email, phone: phone || null });
            res.json({ message: 'Patient updated successfully' });
        } catch (error) {
            console.error('PUT user error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    });

    /* =========================================
       DELETE USER
    ========================================= */
    router.delete('/users/:id', async (req, res) => {
        try {
            await BipolarUser.findOneAndDelete({ _id: req.params.id, role: 'user' });
            res.json({ message: 'User deleted' });
        } catch (error) {
            console.error('DELETE user error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    });

    /* =========================================
       BLOCK USER
    ========================================= */
    router.put('/users/block/:id', async (req, res) => {
        try {
            await BipolarUser.findByIdAndUpdate(req.params.id, { role: 'blocked' });
            res.json({ message: 'User blocked' });
        } catch (error) {
            console.error('BLOCK user error:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    });

    app.use('/api', router);
};
