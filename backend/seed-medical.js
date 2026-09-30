/**
 * Seed Medical Users (Secrétaire, Médecin Fatma, Patient Eya)
 * Usage: node seed-medical.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URL = process.env.DATABASE_URL || 'mongodb://0.0.0.0:27017/medical_psychiatre_db';

async function seedMedical() {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connecté à MongoDB');

    const db = require('./src/database/db.config');

    // Clear medical user collections
    await db.users.deleteMany({});
    await db.patients.deleteMany({});
    await db.medecins.deleteMany({});
    await db.rendezvous.deleteMany({});
    console.log('🗑️  Collections médicales vidées');

    // ─────────────────────────────────────────────────
    // Créer Fatma comme médecin (psychiatre)
    // ─────────────────────────────────────────────────
    const fatma = await new db.medecins({
        nom: 'Belghith', prenom: 'Fatma',
        specialite: 'Psychiatrie',
        telephone: '55100001',
        email: 'fatma@gmail.com',
        actif: true
    }).save();

    // Médecin secondaire pour la démo
    const ahmed = await new db.medecins({
        nom: 'Trabelsi', prenom: 'Ahmed',
        specialite: 'Psychiatrie générale',
        telephone: '55200001',
        email: 'ahmed.trabelsi@psychocare.tn',
        actif: true
    }).save();

    // ─────────────────────────────────────────────────
    // Créer Eya comme patiente
    // ─────────────────────────────────────────────────
    const eya = await new db.patients({
        nom: 'Trabelsi', prenom: 'Eya',
        cin: 'CIN-EYA-001',
        dateNaissance: new Date('1998-03-22'),
        telephone: '55100002',
        email: 'eya@gmail.com',
        adresse: 'Tunis, Tunisie',
        sexe: 'Femme',
        actif: true
    }).save();

    // Patient secondaire pour la démo
    const sami = await new db.patients({
        nom: 'Ben Ali', prenom: 'Sami',
        cin: 'CIN-DEMO-001',
        dateNaissance: new Date('1990-05-15'),
        telephone: '55300001',
        email: 'sami.benali@gmail.com',
        adresse: 'Sfax, Tunisie',
        sexe: 'Homme',
        actif: true
    }).save();

    // ─────────────────────────────────────────────────
    // Créer les comptes utilisateurs
    // ─────────────────────────────────────────────────
    await db.users.insertMany([
        {
            nom: 'Sassi', prenom: 'Leila',
            username: 'secretaire1',
            password: 'secretaire123',
            role: 'secretaire'
        },
        {
            nom: 'Belghith', prenom: 'Fatma',
            username: 'fatma',
            password: 'fatma123',
            role: 'medecin',
            medecinId: fatma._id
        },
        {
            nom: 'Trabelsi', prenom: 'Ahmed',
            username: 'medecin1',
            password: 'medecin123',
            role: 'medecin',
            medecinId: ahmed._id
        },
        {
            nom: 'Trabelsi', prenom: 'Eya',
            username: 'eya',
            password: 'eya123',
            role: 'patient',
            patientId: eya._id
        },
        {
            nom: 'Ben Ali', prenom: 'Sami',
            username: 'patient1',
            password: 'patient123',
            role: 'patient',
            patientId: sami._id
        }
    ]);

    // ─────────────────────────────────────────────────
    // Créer des rendez-vous — Eya chez Fatma
    // ─────────────────────────────────────────────────
    const d = (offset) => {
        const dt = new Date();
        dt.setDate(dt.getDate() + offset);
        return dt;
    };

    await db.rendezvous.insertMany([
        {
            patient: eya._id,
            medecin: fatma._id,
            date: d(2),
            heure: '10:00',
            motif: 'Première consultation',
            statut: 'planifié',
            notes: 'Patiente référée pour bilan psychiatrique'
        },
        {
            patient: eya._id,
            medecin: fatma._id,
            date: d(9),
            heure: '14:30',
            motif: 'Suivi thérapeutique',
            statut: 'planifié',
            notes: 'Suivi mensuel'
        },
        {
            patient: sami._id,
            medecin: fatma._id,
            date: d(4),
            heure: '11:00',
            motif: 'Troubles du sommeil',
            statut: 'confirmé',
            notes: ''
        },
        {
            patient: sami._id,
            medecin: ahmed._id,
            date: d(1),
            heure: '09:00',
            motif: 'Première consultation',
            statut: 'confirmé',
            notes: 'Patient référé par médecin généraliste'
        }
    ]);

    console.log('\n🎉 Seed médical terminé !');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('  LOGIN URL MÉDICAL    : http://localhost:4200/medical/login');
    console.log('───────────────────────────────────────────────────────────────────');
    console.log('  Secrétaire → secretaire1 / secretaire123  → /medical/dashboard');
    console.log('  Fatma (Médecin) → fatma / fatma123        → /medical/rendezvous');
    console.log('  Eya   (Patient) → eya   / eya123          → /medical/patient/dashboard');
    console.log('  Sami  (Patient) → patient1 / patient123   → /medical/patient/dashboard');
    console.log('───────────────────────────────────────────────────────────────────');
    console.log('  LOGIN URL PSY (Admin) : http://localhost:4200/login');
    console.log('  Fatma (Admin Psy) → fatma@gmail.com / fatma123');
    console.log('  Eya   (Patient Psy)→ eya@gmail.com   / eya123');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('  ⚡ FLUX PRINCIPAL:');
    console.log('  1. Eya se connecte → /medical/login  (eya / eya123)');
    console.log('  2. Eya prend un RDV chez Fatma');
    console.log('  3. Fatma se connecte → /login  (fatma@gmail.com / fatma123)');
    console.log('  4. Fatma ouvre Admin Dashboard → Consultations → voit le RDV d\'Eya');
    console.log('═══════════════════════════════════════════════════════════════════');

    await mongoose.disconnect();
}

seedMedical().catch(err => {
    console.error('❌ Seed médical échoué:', err);
    process.exit(1);
});
