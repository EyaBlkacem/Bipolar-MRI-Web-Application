// Routes Appointments - Psychiatre app / MongoDB
module.exports = app => {
    const router = require('express').Router();
    const db = require('../../database/db.config');
    const Appointment = db.appointments;
    const BipolarUser = db.bipolarUsers;

    const format = (a) => ({
        id: a._id,
        patient_id: a.patient_id?._id || a.patient_id,
        doctor_id: a.doctor_id?._id || a.doctor_id,
        fullname: a.patient_id?.fullname,
        email: a.patient_id?.email,
        doctor_name: a.doctor_id?.fullname || 'Admin / Psychiatre',
        appointment_date: a.appointment_date,
        appointment_time: a.appointment_time,
        type: a.type || 'online',
        roomId: a.roomId,
        status: a.status,
        notes: a.notes,
        createdAt: a.createdAt
    });

    router.get('/appointments', async (req, res) => {
        try {
            const appts = await Appointment.find()
                .populate('patient_id', 'fullname email phone')
                .populate('doctor_id', 'fullname email role')
                .sort({ appointment_date: 1, appointment_time: 1 });
            res.json(appts.map(format));
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    router.get('/appointments/patient/:id', async (req, res) => {
        try {
            const appts = await Appointment.find({ patient_id: req.params.id })
                .populate('patient_id', 'fullname email phone')
                .populate('doctor_id', 'fullname email role')
                .sort({ appointment_date: -1, appointment_time: -1 });
            res.json(appts.map(format));
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    router.get('/appointments/today', async (req, res) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const appts = await Appointment.find({ appointment_date: { $gte: today, $lt: tomorrow } })
                .populate('patient_id', 'fullname email')
                .populate('doctor_id', 'fullname email role')
                .sort({ appointment_time: 1 })
                .limit(10);
            res.json(appts.map(format));
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    router.post('/appointments', async (req, res) => {
        try {
            const { patient_id, doctor_id, appointment_date, appointment_time, status, notes, type } = req.body;
            if (!patient_id || !appointment_date || !appointment_time) {
                return res.status(400).json({ message: 'patient_id, appointment_date and appointment_time are required' });
            }
            let finalDoctorId = doctor_id || null;
            if (!finalDoctorId) {
                const admin = await BipolarUser.findOne({ role: 'admin' }).sort({ createdAt: 1 });
                finalDoctorId = admin?._id || null;
            }
            const appt = new Appointment({
                patient_id,
                doctor_id: finalDoctorId,
                appointment_date,
                appointment_time,
                status: status || 'pending',
                notes: notes || '',
                type: type || 'online'
            });
            await appt.save();
            const populatedAppt = await appt.populate('patient_id doctor_id');
            const formatted = format(populatedAppt);
            global.io?.emit('appointment-updated', { action: 'created', appointment: formatted });
            global.io?.emit('appointment-booked', {
                appointmentId: formatted.id,
                patientId: formatted.patient_id,
                doctorId: formatted.doctor_id,
                patientName: formatted.fullname,
                doctorName: formatted.doctor_name,
                date: formatted.appointment_date,
                time: formatted.appointment_time,
                status: formatted.status
            });
            res.json({ message: 'Appointment created', id: appt._id, appointment: formatted });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    router.put('/appointments/:id', async (req, res) => {
        try {
            const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
                .populate('patient_id', 'fullname email phone')
                .populate('doctor_id', 'fullname email role');
            if (!appt) return res.status(404).json({ message: 'Appointment not found' });
            const formatted = format(appt);
            global.io?.emit('appointment-updated', { action: 'updated', appointment: formatted });
            res.json({ message: 'Appointment updated', appointment: formatted });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    router.delete('/appointments/:id', async (req, res) => {
        try {
            await Appointment.findByIdAndDelete(req.params.id);
            global.io?.emit('appointment-updated', { action: 'deleted', id: req.params.id });
            res.json({ message: 'Appointment deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    router.get('/doctors/admins', async (req, res) => {
        try {
            const admins = await BipolarUser.find({ role: 'admin' }).select('fullname email role').sort({ fullname: 1 });
            res.json(admins.map(a => ({ id: a._id, fullname: a.fullname, email: a.email, role: a.role })));
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });

    app.use('/api', router);
};
