const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URL = process.env.DATABASE_URL || 'mongodb://0.0.0.0:27017/medical_psychiatre_db';

// ============================================================
// SCHEMAS (inline pour le seed)
// ============================================================
const BipolarUserSchema = new mongoose.Schema({
    fullname:  { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    phone:     { type: String, default: null },
    role:      { type: String, enum: ['admin', 'user', 'blocked'], default: 'user' }
}, { timestamps: true });

const AppointmentSchema = new mongoose.Schema({
    patient_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'BipolarUser', required: true },
    appointment_date: { type: Date, required: true },
    appointment_time: { type: String, required: true },
    status:           { type: String, enum: ['pending', 'confirmed', 'cancelled', 'done'], default: 'pending' },
    notes:            { type: String, default: '' }
}, { timestamps: true });

const AssessmentSchema = new mongoose.Schema({
    patientId:       { type: mongoose.Schema.Types.ObjectId, ref: 'BipolarUser', required: true },
    date:            { type: Date, default: Date.now },
    humeur:          { type: Number, min: 1, max: 10, required: true },
    heureSommeil:    { type: Number, min: 0, max: 24, required: true },
    qualiteSommeil:  { type: String, enum: ['mauvaise', 'moyenne', 'bonne', 'excellente'], required: true },
    energie:         { type: Number, min: 1, max: 10, required: true },
    anxiete:         { type: Number, min: 1, max: 10, required: true },
    irritabilite:    { type: Number, min: 1, max: 10, required: true },
    penseesRapides:  { type: Boolean, default: false },
    medicamentsPris: { type: Boolean, default: true },
    notes:           { type: String, default: '' }
}, { timestamps: true });

const ReportSchema = new mongoose.Schema({
    user_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'BipolarUser', required: true },
    form_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    risk_level:      { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    diagnosis:       { type: String, default: '' },
    recommendations: { type: String, default: '' }
}, { timestamps: true });

const BipolarUser  = mongoose.model('BipolarUser',  BipolarUserSchema);
const Appointment  = mongoose.model('Appointment',  AppointmentSchema);
const Assessment   = mongoose.model('Assessment',   AssessmentSchema);
const Report       = mongoose.model('Report',       ReportSchema);

// ============================================================
// SEED FUNCTION
// ============================================================
async function seed() {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connecté à MongoDB');

    // Vider les collections psychiatre
    await BipolarUser.deleteMany({});
    await Appointment.deleteMany({});
    await Assessment.deleteMany({});
    await Report.deleteMany({});
    console.log('🗑️  Collections vidées');

    // ============================================================
    // UTILISATEURS
    //   fatma@gmail.com  → admin (psy)    mdp: fatma123
    //   eya@gmail.com    → patient (user) mdp: eya123
    // ============================================================
    const fatmaPassword = await bcrypt.hash('fatma123', 10);
    const eyaPassword   = await bcrypt.hash('eya123',   10);

    const fatma = await new BipolarUser({
        fullname: 'Fatma Belghith',
        email:    'fatma@gmail.com',
        password: fatmaPassword,
        phone:    '55100001',
        role:     'admin'
    }).save();

    const eya = await new BipolarUser({
        fullname: 'Eya Belkacem',
        email:    'eya@gmail.com',
        password: eyaPassword,
        phone:    '55100002',
        role:     'user'
    }).save();

    // Autres patients de démo
    const otherPatients = await BipolarUser.insertMany([
        { fullname: 'Ahmed Hamdi',    email: 'ahmed@gmail.com',   password: await bcrypt.hash('ahmed123',   10), phone: '55100003', role: 'user' },
        { fullname: 'Sara Jebali',    email: 'sara@gmail.com',    password: await bcrypt.hash('sara123',    10), phone: '55100004', role: 'user' },
        { fullname: 'Mohamed Riahi',  email: 'mohamed@gmail.com', password: await bcrypt.hash('mohamed123', 10), phone: '55100005', role: 'user' },
    ]);
    const allPatients = [eya, ...otherPatients];

    console.log(`👤 Utilisateurs insérés :`);
    console.log(`   ADMIN  : ${fatma.fullname} <${fatma.email}>  →  mdp: fatma123`);
    console.log(`   PATIENT: ${eya.fullname}   <${eya.email}>     →  mdp: eya123`);
    otherPatients.forEach(p => console.log(`   PATIENT: ${p.fullname} <${p.email}>`));

    // ============================================================
    // RENDEZ-VOUS
    // ============================================================
    const today = new Date();
    const d = (offset) => {
        const dt = new Date(today);
        dt.setDate(dt.getDate() + offset);
        return dt;
    };

    const appts = await Appointment.insertMany([
        { patient_id: eya._id,               appointment_date: d(1),  appointment_time: '09:00', status: 'confirmed', notes: 'Première consultation'  },
        { patient_id: eya._id,               appointment_date: d(7),  appointment_time: '10:30', status: 'pending',   notes: 'Suivi mensuel'           },
        { patient_id: otherPatients[0]._id,  appointment_date: d(0),  appointment_time: '11:00', status: 'pending',   notes: ''                        },
        { patient_id: otherPatients[1]._id,  appointment_date: d(2),  appointment_time: '14:00', status: 'confirmed', notes: 'Évaluation bipolarité'    },
        { patient_id: otherPatients[2]._id,  appointment_date: d(3),  appointment_time: '15:30', status: 'pending',   notes: ''                        },
        { patient_id: eya._id,               appointment_date: d(-7), appointment_time: '09:00', status: 'done',      notes: 'Terminé'                 },
    ]);
    console.log(`📅 ${appts.length} rendez-vous insérés`);

    // ============================================================
    // ASSESSMENTS (bilans)
    // ============================================================
    const assessments = await Assessment.insertMany([
        {
            patientId: eya._id,
            humeur: 6, heureSommeil: 7, qualiteSommeil: 'bonne',
            energie: 6, anxiete: 4, irritabilite: 3,
            penseesRapides: false, medicamentsPris: true,
            notes: 'Se sent mieux cette semaine'
        },
        {
            patientId: eya._id,
            humeur: 3, heureSommeil: 5, qualiteSommeil: 'mauvaise',
            energie: 3, anxiete: 8, irritabilite: 7,
            penseesRapides: true, medicamentsPris: true,
            notes: 'Épisode dépressif léger'
        },
        {
            patientId: otherPatients[0]._id,
            humeur: 8, heureSommeil: 8, qualiteSommeil: 'excellente',
            energie: 9, anxiete: 2, irritabilite: 2,
            penseesRapides: true, medicamentsPris: false,
            notes: 'Phase hypomaniaque possible'
        },
        {
            patientId: otherPatients[1]._id,
            humeur: 5, heureSommeil: 6, qualiteSommeil: 'moyenne',
            energie: 5, anxiete: 5, irritabilite: 4,
            penseesRapides: false, medicamentsPris: true,
            notes: ''
        },
        {
            patientId: otherPatients[2]._id,
            humeur: 2, heureSommeil: 4, qualiteSommeil: 'mauvaise',
            energie: 2, anxiete: 9, irritabilite: 8,
            penseesRapides: true, medicamentsPris: false,
            notes: 'Arrêt médicament — urgence à signaler'
        },
    ]);
    console.log(`📋 ${assessments.length} assessments insérés`);

    // ============================================================
    // RAPPORTS
    // ============================================================
    const reports = await Report.insertMany([
        {
            user_id: eya._id,
            form_id: assessments[0]._id,
            risk_level: 'low',
            diagnosis: 'Stabilisation en cours',
            recommendations: 'Continuer le traitement. Suivi mensuel.'
        },
        {
            user_id: eya._id,
            form_id: assessments[1]._id,
            risk_level: 'medium',
            diagnosis: 'Épisode dépressif léger',
            recommendations: 'Augmenter la dose de Lithium. Rendez-vous sous 2 semaines.'
        },
        {
            user_id: otherPatients[0]._id,
            form_id: assessments[2]._id,
            risk_level: 'high',
            diagnosis: 'Épisode hypomaniaque — arrêt médicament',
            recommendations: 'Hospitalisation de jour envisagée. Contacter famille.'
        },
    ]);
    console.log(`📊 ${reports.length} rapports insérés`);

    console.log('\n🎉 Seed terminé avec succès !');
    console.log('═══════════════════════════════════════════');
    console.log('   CONNEXION ADMIN   → fatma@gmail.com / fatma123');
    console.log('   CONNEXION PATIENT → eya@gmail.com   / eya123');
    console.log('═══════════════════════════════════════════');

    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
}

seed().catch(err => {
    console.error('❌ Seed échoué:', err);
    process.exit(1);
});
