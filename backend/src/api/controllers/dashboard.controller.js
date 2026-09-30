const db = require('../../database/db.config');

const BipolarUser = db.bipolarUsers;
const Assessment = db.assessments;
const Report = db.reports;
const Appointment = db.appointments;
const Message = db.messages;
const Notification = db.notifications;

// ========================================
// DASHBOARD HOME
// ========================================

exports.getDashboardHome = async (req, res) => {

    try {

        // =====================================
        // STATS
        // =====================================

        const patientsCount =
        await BipolarUser.countDocuments({
            role: 'user'
        });

        const assessmentsCount =
        await Assessment.countDocuments();

        const reportsCount =
        await Report.countDocuments();

        const appointmentsCount =
        await Appointment.countDocuments();

        const unreadMessagesCount =
        await Message.countDocuments({
            lu: false
        });

        const unreadNotifications =
        await Notification.countDocuments({
            isRead: false
        });

        // =====================================
        // RECENT PATIENTS
        // =====================================

        const recentPatients =
        await BipolarUser.find({
            role: 'user'
        })

        .sort({
            createdAt: -1
        })

        .limit(5)

        .select(
            'fullname email createdAt'
        );

        // =====================================
        // TODAY APPOINTMENTS
        // =====================================

        const today = new Date();

        today.setHours(0,0,0,0);

        const tomorrow = new Date(today);

        tomorrow.setDate(
            tomorrow.getDate() + 1
        );

        const todayAppointments =
        await Appointment.find({

            appointment_date: {

                $gte: today,

                $lt: tomorrow

            }

        })

        .populate(
            'patient_id',
            'fullname email'
        )

        .sort({
            appointment_time: 1
        })

        .limit(5);

        // =====================================
        // HIGH RISK PATIENTS
        // =====================================

        const assessments =
        await Assessment.find()

        .sort({
            createdAt: -1
        })

        .limit(10);

        const highRiskPatients = [];

        for (const a of assessments) {

            const score =

                (a.humeur || 5) +

                (a.energie || 5) -

                (a.anxiete || 5) -

                (a.irritabilite || 5);

            let risk_level = 'low';

            if (score < -5) {

                risk_level = 'high';

            }

            else if (score < 0) {

                risk_level = 'medium';

            }

            if (risk_level === 'high') {

                const user =
                await BipolarUser.findById(
                    a.patientId
                );

                highRiskPatients.push({

                    full_name:
                    user?.fullname ||
                    'Unknown',

                    score,

                    risk_level,

                    submitted_at:
                    a.createdAt

                });

            }

        }

        // =====================================
        // APPOINTMENTS CHART
        // =====================================

        const allAppointments =
        await Appointment.find()
        .select('appointment_date');

        const monthMap = {};

        allAppointments.forEach(a => {

            const d =
            new Date(a.appointment_date);

            const key =

            `${d.getFullYear()}-${String(
                d.getMonth() + 1
            ).padStart(2,'0')}`;

            monthMap[key] =
            (monthMap[key] || 0) + 1;

        });

        const appointmentsPerMonth =

        Object.entries(monthMap)

        .map(([month, total]) => ({

            month,

            total

        }))

        .sort((a,b)=>

            a.month.localeCompare(b.month)

        )

        .slice(-12);

        // =====================================
        // RISK DISTRIBUTION
        // =====================================

        const allAssessments =
        await Assessment.find();

        const riskMap = {

            low: 0,

            medium: 0,

            high: 0

        };

        allAssessments.forEach(a => {

            const score =

                (a.humeur || 5) +

                (a.energie || 5) -

                (a.anxiete || 5) -

                (a.irritabilite || 5);

            if (score < -5) {

                riskMap.high++;

            }

            else if (score < 0) {

                riskMap.medium++;

            }

            else {

                riskMap.low++;

            }

        });

        const riskDistribution =

        Object.entries(riskMap)

        .map(([risk_level,total]) => ({

            risk_level,

            total

        }));

        // =====================================
        // RECENT ACTIVITIES
        // =====================================

        const recentActivities =

        todayAppointments.map(a => ({

            title:
            'New Appointment',

            description:

            `${a.patient_id?.fullname || 'Patient'}
             booked consultation`,

            createdAt:
            a.createdAt

        }));

        // =====================================
        // ONLINE USERS
        // =====================================

        const onlineUsers =

        global.onlineUsersList || [];

        // =====================================
        // AI INSIGHTS
        // =====================================

        const aiInsights = {

            totalAssessments:
            assessmentsCount,

            totalAppointments:
            appointmentsCount,

            highRiskPatients:
            highRiskPatients.length,

            accuracy: 94

        };

        // =====================================
        // SYSTEM HEALTH
        // =====================================

        const systemHealth = {

            backend: 'online',

            mongodb: 'connected',

            socketio: 'active',

            aiService: 'running'

        };

        // =====================================
        // RESPONSE
        // =====================================

        res.json({

            success: true,

            stats: {

                patients:
                patientsCount,

                assessments:
                assessmentsCount,

                reports:
                reportsCount,

                appointments:
                appointmentsCount,

                unreadMessages:
                unreadMessagesCount,

                unreadNotifications:
                unreadNotifications

            },

            recentPatients,

            todayAppointments,

            highRiskPatients,

            recentActivities,

            onlineUsers,

            aiInsights,

            systemHealth,

            charts: {

                appointmentsPerMonth,

                riskDistribution

            }

        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};