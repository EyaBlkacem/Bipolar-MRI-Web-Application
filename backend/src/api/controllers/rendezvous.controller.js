const db =
require('../../database/db.config');

const Rendezvous =
db.rendezvous;

const Notification =
db.notifications;

// ==========================================
// CREATE
// ==========================================

exports.create =
async (req, res) => {

    try {

        const rendezvous =
        new Rendezvous({

            patient:
                req.body.patient,

            medecin:
                req.body.medecin,

            date:
                req.body.date,

            heure:
                req.body.heure,

            motif:
                req.body.motif,

            status:
                'pending'

        });

        const saved =
        await rendezvous.save();

        // =========================
        // CREATE NOTIFICATION
        // =========================

        const notification =
        new Notification({

            title:
                'Nouveau rendez-vous',

            message:
                'Un patient a pris un rendez-vous',

            type:
                'appointment',

            isRead:
                false

        });

        const savedNotif =
        await notification.save();

        // =========================
        // SOCKET
        // =========================

        if (global.io) {

            global.io.emit(
                'newNotification',
                savedNotif
            );

        }

        res.status(201).json(saved);

    }

    catch(err){

        console.log(err);

        res.status(500).json({
            message: err.message
        });

    }

};

// ==========================================
// FIND ALL
// ==========================================

exports.findAll =
async (req, res) => {

    try {

        const data =
        await Rendezvous.find()

        .sort({
            createdAt: -1
        });

        res.json(data);

    }

    catch(err){

        res.status(500).json({
            message: err.message
        });

    }

};

// ==========================================
// FIND ONE
// ==========================================

exports.findOne =
async (req, res) => {

    try {

        const data =
        await Rendezvous.findById(
            req.params.id
        );

        res.json(data);

    }

    catch(err){

        res.status(500).json({
            message: err.message
        });

    }

};

// ==========================================
// FIND BY PATIENT
// ==========================================

exports.findByPatient =
async (req, res) => {

    try {

        const data =
        await Rendezvous.find({

            patient:
            req.params.patientId

        });

        res.json(data);

    }

    catch(err){

        res.status(500).json({
            message: err.message
        });

    }

};

// ==========================================
// UPDATE
// ==========================================

exports.update =
async (req, res) => {

    try {

        const updated =
        await Rendezvous.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new: true
            }

        );

        res.json(updated);

    }

    catch(err){

        res.status(500).json({
            message: err.message
        });

    }

};

// ==========================================
// DELETE
// ==========================================

exports.delete =
async (req, res) => {

    try {

        await Rendezvous.findByIdAndDelete(
            req.params.id
        );

        res.json({
            success: true
        });

    }

    catch(err){

        res.status(500).json({
            message: err.message
        });

    }

};