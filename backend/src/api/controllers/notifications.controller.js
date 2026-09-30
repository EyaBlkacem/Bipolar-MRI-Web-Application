const db =
require('../../database/db.config');

const Notification =
db.notifications;

// ======================================
// GET ALL
// ======================================

exports.findAll = async (req, res) => {

    try {

        const notifications =
        await Notification.find()

        .sort({
            createdAt: -1
        })

        .limit(20);

        res.send(notifications);

    }

    catch(err){

        res.status(500).send({
            message: err.message
        });

    }

};

// ======================================
// MARK READ
// ======================================

exports.markAsRead =
async (req, res) => {

    try {

        await Notification.findByIdAndUpdate(
            req.params.id,
            {
                isRead: true
            }
        );

        res.send({
            success: true
        });

    }

    catch(err){

        res.status(500).send({
            message: err.message
        });

    }

};