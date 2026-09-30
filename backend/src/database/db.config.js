const config = require('../config/config');

const mongoose = require('mongoose');

const db = {};

// ==========================================
// MONGOOSE CONFIG
// ==========================================

mongoose.Promise = global.Promise;

mongoose.set('strictQuery', false);

db.mongoose = mongoose;

db.url = config.DB_URL;

// ==========================================
// PROJET 1 - MEDICAL
// ==========================================

db.patients =
require('../api/models/patient.model')(mongoose);

db.medecins =
require('../api/models/medecin.model')(mongoose);

db.rendezvous =
require('../api/models/rendezvous.model')(mongoose);

db.users =
require('../api/models/user.model')(mongoose);

db.messages =
require('../api/models/message.model')(mongoose);

db.assessments =
require('../api/models/assessment.model')(mongoose);

// ==========================================
// GLOBAL NOTIFICATIONS
// ==========================================

db.notifications =
require('../api/models/notification.model')(mongoose);

// ==========================================
// PROJET 2 - PSYCHIATRE / BIPOLAR
// ==========================================

db.bipolarUsers =
require('../api/models/bipolarUser.model')(mongoose);

db.appointments =
require('../api/models/appointment.model')(mongoose);

db.reports =
require('../api/models/report.model')(mongoose);

db.consultations =
require('../api/models/consultation.model')(mongoose);

db.aiAssessments =
require('../api/models/aiAssessment.model')(mongoose);

// ==========================================
// EXPORT
// ==========================================

module.exports = db;