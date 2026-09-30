const db = require('../../database/db.config');

const Patient = db.patients;
const BipolarUser = db.bipolarUsers;
const Appointment = db.appointments;
const Assessment = db.assessments;

// ======================================
// CREATE PATIENT MEDICAL
// ======================================

exports.create = (req, res) => {
    const {
        nom,
        prenom,
        cin,
        dateNaissance,
        telephone,
        email,
        adresse,
        sexe
    } = req.body;

    if (!nom || !prenom || !cin || !dateNaissance || !telephone || !sexe) {
        return res.status(400).send({
            message: 'Les champs obligatoires sont manquants'
        });
    }

    const newPatient = new Patient({
        nom,
        prenom,
        cin,
        dateNaissance,
        telephone,
        email,
        adresse,
        sexe
    });

    newPatient.save()
        .then(data => res.status(201).send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

// ======================================
// FIND ALL MEDICAL PATIENTS
// ======================================

exports.findAll = (req, res) => {
    const search = req.query.search;
    let condition = {};

    if (search) {
        condition = {
            $or: [
                { nom: { $regex: search, $options: 'i' } },
                { prenom: { $regex: search, $options: 'i' } },
                { cin: { $regex: search, $options: 'i' } }
            ]
        };
    }

    Patient.find(condition)
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

// ======================================
// FIND ONE MEDICAL PATIENT
// ======================================

exports.findOne = (req, res) => {
    const id = req.params.id;

    Patient.findById(id)
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    message: 'Patient non trouvé'
                });
            }

            res.send(data);
        })
        .catch(err => res.status(500).send({ message: err.message }));
};

// ======================================
// UPDATE MEDICAL PATIENT
// ======================================

exports.update = (req, res) => {
    const id = req.params.id;

    Patient.findByIdAndUpdate(
        id,
        req.body,
        {
            useFindAndModify: false,
            new: true
        }
    )
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    message: 'Patient non trouvé'
                });
            }

            res.send({
                message: 'Patient mis à jour avec succès',
                data
            });
        })
        .catch(err => res.status(500).send({ message: err.message }));
};

// ======================================
// DELETE MEDICAL PATIENT
// ======================================

exports.delete = (req, res) => {
    const id = req.params.id;

    Patient.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    message: 'Patient non trouvé'
                });
            }

            res.send({
                message: 'Patient supprimé avec succès'
            });
        })
        .catch(err => res.status(500).send({ message: err.message }));
};

// ======================================
// FULL DYNAMIC DATA FOR ANGULAR PATIENT PAGE
// ======================================

exports.getFullPatientsData = async (req, res) => {

    try {

        const patients = await BipolarUser.find({
            role: 'user'
        }).sort({
            createdAt: -1
        });

        const finalPatients = await Promise.all(

            patients.map(async (patient) => {

                // =========================
                // APPOINTMENTS
                // =========================

                const appointments =
                await Appointment.find({
                    patient_id: patient._id
                }).sort({
                    appointment_date: -1
                });

                const lastAppointment =
                appointments[0] || null;

                // =========================
                // LAST ASSESSMENT
                // =========================

                const assessment =
                await Assessment.findOne({
                    patientId: patient._id
                }).sort({
                    createdAt: -1
                });

                // =========================
                // RISK
                // =========================

                let bipolarRisk = 5;

                let riskLevel = 'Low';

                if (assessment) {

                    const humeur =
                    Number(assessment.humeur || 0);

                    const energie =
                    Number(assessment.energie || 0);

                    const anxiete =
                    Number(assessment.anxiete || 0);

                    const irritabilite =
                    Number(assessment.irritabilite || 0);

                    // =====================
                    // REAL CALCULATION
                    // =====================

                    bipolarRisk =
                    Math.round(

                        (
                            humeur * 3 +
                            energie * 2 +
                            anxiete * 4 +
                            irritabilite * 4
                        ) / 13 * 100

                    );

                    // =====================
                    // LIMIT
                    // =====================

                    if (bipolarRisk > 100) {
                        bipolarRisk = 100;
                    }

                    if (bipolarRisk < 0) {
                        bipolarRisk = 0;
                    }

                    // =====================
                    // LEVEL
                    // =====================

                    if (bipolarRisk >= 70) {

                        riskLevel = 'High';

                    }

                    else if (bipolarRisk >= 40) {

                        riskLevel = 'Medium';

                    }

                    else {

                        riskLevel = 'Low';

                    }

                }

                // =========================
                // MRI
                // =========================

                let mriStatus = 'Pending';

                if (
                    assessment?.mriPrediction ||
                    assessment?.mriStatus === 'Completed'
                ) {

                    mriStatus = 'Completed';

                }

                // =========================
                // VOICE
                // =========================

                let voiceStatus = 'Pending';

                if (
                    assessment?.voicePrediction ||
                    assessment?.voiceStatus === 'Completed'
                ) {

                    voiceStatus = 'Completed';

                }

                // =========================
                // ONLINE RANDOM
                // =========================

                const online =
                Math.random() > 0.5;

                // =========================
                // RETURN
                // =========================

                return {

                    id: patient._id,

                    fullname:
                    patient.fullname ||
                    patient.name ||
                    'Patient',

                    email:
                    patient.email || '',

                    phone:
                    patient.phone ||
                    patient.telephone ||
                    'Not provided',

                    created_at:
                    patient.createdAt,

                    online,

                    visits_count:
                    appointments.length,

                    lastVisit:
                    lastAppointment?.appointment_date ||
                    null,

                    bipolarRisk,

                    riskLevel,

                    mriStatus,

                    voiceStatus,

                    aiRecommendation:

                    riskLevel === 'High'

                        ? 'Urgent psychiatric follow-up required'

                        : riskLevel === 'Medium'

                        ? 'Patient should be monitored closely'

                        : 'Patient stable',

                    notes:
                    assessment?.notes || '',

                    files:
                    patient.files || []

                };

            })

        );

        res.json(finalPatients);

    }

    catch (err) {

        console.log(
            'FULL PATIENTS DATA ERROR:',
            err
        );

        res.status(500).json({
            message: err.message
        });

    }

};

// ======================================
// RECENT ACTIVITIES
// ======================================

exports.getRecentActivities = async (req, res) => {
    try {
        const patients = await BipolarUser.find({
            role: 'user'
        })
            .sort({ createdAt: -1 })
            .limit(5);

        const activities = patients.map(patient => ({
            title: patient.fullname || 'Patient',
            text: 'Nouveau patient ajouté',
            date: patient.createdAt
        }));

        res.json(activities);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

// ======================================
// CRITICAL ALERTS
// ======================================

exports.getCriticalAlerts = async (req, res) => {
    try {
        const assessments = await Assessment.find()
            .sort({ createdAt: -1 })
            .limit(20);

        const alerts = [];

        for (const assessment of assessments) {
            const score =
                (
                    Number(assessment.humeur || 0) +
                    Number(assessment.energie || 0) +
                    Number(assessment.anxiete || 0) +
                    Number(assessment.irritabilite || 0)
                ) * 5;

            if (score >= 70) {
                const patient = await BipolarUser.findById(
                    assessment.patientId
                );

                if (patient) {
                    alerts.push({
                        id: patient._id,
                        fullname: patient.fullname || 'Patient',
                        risk: score,
                        message: `${patient.fullname || 'Patient'} has severe bipolar risk`
                    });
                }
            }
        }

        res.json(alerts);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};