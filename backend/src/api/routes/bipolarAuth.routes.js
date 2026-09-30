// Routes Auth pour l'app Psychiatre - MongoDB
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const ADMIN_EMAILS = ['fatma@gmail.com'];

module.exports = app => {
    const router     = require('express').Router();
    const db         = require('../../database/db.config');
    const BipolarUser = db.bipolarUsers;

    /* ======================================================
       SIGNUP
    ====================================================== */
    router.post('/bipolar/signup', async (req, res) => {
        try {
            const { fullname, email, password } = req.body;

            if (!fullname || !email || !password) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const existing = await BipolarUser.findOne({ email });
            if (existing) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user';

            const newUser = new BipolarUser({ fullname, email, password: hashedPassword, role });
            const saved   = await newUser.save();

            const token = jwt.sign(
                { id: saved._id, role: saved.role },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '1d' }
            );

            res.json({
                success: true, token,
                user: { id: saved._id, fullname: saved.fullname, email: saved.email, role: saved.role }
            });
        } catch (error) {
            console.error('SIGNUP ERROR:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    /* ======================================================
       LOGIN
    ====================================================== */
    router.post('/bipolar/login', async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password required' });
            }

            const user = await BipolarUser.findOne({ email });
            if (!user) {
                return res.status(400).json({ success: false, message: 'User not found' });
            }

            if (user.role === 'blocked') {
                return res.status(403).json({ success: false, message: 'Account blocked' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Wrong password' });
            }

            // Force admin role si email admin
            if (ADMIN_EMAILS.includes(email.toLowerCase()) && user.role !== 'admin') {
                await BipolarUser.findByIdAndUpdate(user._id, { role: 'admin' });
                user.role = 'admin';
            }

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '1d' }
            );

            res.json({
                success: true, token,
                user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role }
            });
        } catch (error) {
            console.error('LOGIN ERROR:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    /* ======================================================
       PROFILE
    ====================================================== */
    router.get('/bipolar/profile', async (req, res) => {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader) return res.status(403).json({ success: false, message: 'No token provided' });

            const token   = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            const user    = await BipolarUser.findById(decoded.id).select('-password');
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            res.json({ success: true, user: user.toJSON() });
        } catch (error) {
            console.error('PROFILE ERROR:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

    app.use('/api/auth', router);
};
