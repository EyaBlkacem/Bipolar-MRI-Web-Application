const db =
require('../../database/db.config');

const Assessment =
db.assessments;

const Notification =
db.notifications;

const axios =
require('axios');

const AI_SERVICE_URL =
'http://127.0.0.1:5001';

// ======================================
// CREATE ASSESSMENT
// ======================================

exports.create = async (req, res) => {

    try {

        // ==================================
        // CALL AI SERVICE
        // ==================================

        const aiResponse =
        await axios.post(

            `${AI_SERVICE_URL}/predict-form`,

            {
                answers:
                req.body.answers || req.body
            }

        );

        const aiData =
        aiResponse.data;

        // ==================================
        // CREATE ASSESSMENT
        // ==================================

        const assessment =
        new Assessment({

            ...req.body,

            aiPrediction:
            aiData.prediction,

            aiScore:
            aiData.score,

            aiLevel:
            aiData.level,

            aiProbability:
            aiData.probability,

            aiMessage:
            aiData.message,

            createdAt:
            new Date()

        });

        const saved =
        await assessment.save();

        // ==================================
        // CREATE NOTIFICATION
        // ==================================

        const notification =
        new Notification({

            title:
            'New Assessment',

            message:
            `New bipolar assessment added`,

            type:
            'assessment',

            isRead:
            false

        });

        const savedNotification =
        await notification.save();

        // ==================================
        // REALTIME SOCKET
        // ==================================

        if (global.io) {

            global.io.emit(

                'newNotification',

                {

                    _id:
                    savedNotification._id,

                    title:
                    savedNotification.title,

                    message:
                    savedNotification.message,

                    type:
                    savedNotification.type,

                    isRead:
                    false,

                    createdAt:
                    savedNotification.createdAt

                }

            );

        }

        // ==================================
        // RESPONSE
        // ==================================

        res.status(201).json({

            message:
            'Assessment created successfully',

            assessment:
            saved,

            ai:
            aiData

        });

    }

    catch (err) {

        console.log(
            'ASSESSMENT ERROR:',
            err
        );

        res.status(500).json({

            message:
            err.message

        });

    }

};

// ======================================
// FIND ALL
// ======================================

exports.findAll = async (req, res) => {

    try {

        const assessments =
        await Assessment.find()

        .sort({
            createdAt: -1
        });

        res.json(assessments);

    }

    catch (err) {

        res.status(500).json({

            message:
            err.message

        });

    }

};

// ======================================
// FIND BY PATIENT
// ======================================

exports.findByPatient = async (req, res) => {

    try {

        const assessments =

        await Assessment.find({

            patientId:
            req.params.patientId

        })

        .sort({
            createdAt: -1
        });

        res.json(assessments);

    }

    catch (err) {

        res.status(500).json({

            message:
            err.message

        });

    }

};

// ======================================
// FIND ONE
// ======================================

exports.findOne = async (req, res) => {

    try {

        const assessment =

        await Assessment.findById(
            req.params.id
        );

        if (!assessment) {

            return res.status(404).json({

                message:
                'Assessment not found'

            });

        }

        res.json(assessment);

    }

    catch (err) {

        res.status(500).json({

            message:
            err.message

        });

    }

};

// ======================================
// DELETE
// ======================================

exports.delete = async (req, res) => {

    try {

        await Assessment.findByIdAndDelete(
            req.params.id
        );

        res.json({

            message:
            'Assessment deleted'

        });

    }

    catch (err) {

        res.status(500).json({

            message:
            err.message

        });

    }

};