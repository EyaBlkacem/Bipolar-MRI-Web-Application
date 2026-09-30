// Routes Consultations vidéo - MongoDB
module.exports = app => {
    const router = require('express').Router();
    const db = require('../../database/db.config');
    const Consultation = db.consultations;
    const BipolarUser = db.bipolarUsers;
    const Appointment = db.appointments;

    router.get('/consultations/patients', async (req, res) => {
        try {
            const patients = await BipolarUser.find({ role: 'user' }).sort({ createdAt: -1 }).select('fullname email role');
            res.json(patients.map(p => ({ id: p._id, fullname: p.fullname, email: p.email, role: p.role, type: 'online', status: 'active' })));
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    router.post('/consultations/create', async (req, res) => {
        try {
            const { patient_id, doctor_id, roomId, type } = req.body;
            if (!patient_id) return res.status(400).json({ message: 'patient_id is required' });
            let finalDoctorId = doctor_id || null;
            if (!finalDoctorId) {
                const admin = await BipolarUser.findOne({ role: 'admin' }).sort({ createdAt: 1 });
                finalDoctorId = admin?._id;
            }
            const consultation = new Consultation({
                patient_id,
                doctor_id: finalDoctorId,
                roomId: roomId || `consult-${patient_id}-${Date.now()}`,
                type: type || 'online',
                status: 'active'
            });
            await consultation.save();
            global.io?.emit('consultation-updated', { action: 'created', consultation });
            res.json({ success: true, consultation });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    router.get('/consultations', async (req, res) => {
        try {
            const consultations = await Consultation.find()
                .populate('patient_id', 'fullname email')
                .populate('doctor_id', 'fullname email role')
                .sort({ createdAt: -1 });

            const direct = consultations.map(c => ({
                id: c._id,
                patient_id: c.patient_id?._id,
                doctor_id: c.doctor_id?._id,
                doctor_name: c.doctor_id?.fullname || 'Admin / Psychiatre',
                roomId: c.roomId,
                type: c.type,
                status: c.status,
                fullname: c.patient_id?.fullname || 'Patient inconnu',
                email: c.patient_id?.email || '',
                createdAt: c.createdAt,
                source: 'consultation'
            }));

            const onlineAppointments = await Appointment.find({ type: 'online', status: { $in: ['pending', 'confirmed'] } })
                .populate('patient_id', 'fullname email')
                .populate('doctor_id', 'fullname email role')
                .sort({ appointment_date: 1, appointment_time: 1 });

            const fromAppointments = onlineAppointments.map(a => ({
                id: a._id,
                patient_id: a.patient_id?._id,
                doctor_id: a.doctor_id?._id,
                doctor_name: a.doctor_id?.fullname || 'Admin / Psychiatre',
                roomId: a.roomId,
                type: 'online',
                status: a.status === 'confirmed' ? 'active' : 'pending',
                fullname: a.patient_id?.fullname || 'Patient inconnu',
                email: a.patient_id?.email || '',
                date: a.appointment_date,
                heure: a.appointment_time,
                motif: a.notes,
                createdAt: a.createdAt,
                source: 'appointment'
            }));

            res.json([...fromAppointments, ...direct]);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    router.get('/consultations/patient/:id', async (req, res) => {
        try {
            const consultation = await Consultation.findOne({ patient_id: req.params.id, status: 'active' }).sort({ createdAt: -1 });
            if (consultation) return res.json(consultation);
            const appointment = await Appointment.findOne({ patient_id: req.params.id, type: 'online', status: { $in: ['pending', 'confirmed'] } }).sort({ appointment_date: 1 });
            if (!appointment) return res.json(null);
            res.json({ id: appointment._id, patient_id: appointment.patient_id, doctor_id: appointment.doctor_id, roomId: appointment.roomId, type: 'online', status: appointment.status });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    router.delete('/consultations/:id', async (req, res) => {
        try {
            await Consultation.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    app.use('/api', router);
};
