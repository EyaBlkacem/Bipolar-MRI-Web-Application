# PsychoCare - Application Médicale & Psychiatrique

## Architecture

Ce projet est composé de deux parties fusionnées :
- **Projet 1 (Médical)** — Gestion des patients, médecins et rendez-vous
- **Projet 2 (Psychiatre)** — Tableau de bord admin, consultations vidéo, bilans bipolaires

---

## Démarrage rapide

### 1. Backend

```bash
cd backend
npm install
npm start
# Serveur sur http://localhost:3000
```

### 2. Frontend (Angular)

```bash
cd frontend
npm install
ng serve
# App sur http://localhost:4200
```

---

## Initialisation de la base de données

```bash
cd backend

# Seed psychiatre (Fatma + Eya côté admin)
node seed.js

# Seed médical (Fatma médecin + Eya patiente + RDV)
node seed-medical.js
```

---

## Comptes de test

### Interface Psychiatre (Admin Dashboard)
URL : `http://localhost:4200/login`

| Rôle   | Email               | Mot de passe |
|--------|---------------------|-------------|
| Admin (Psy Fatma) | fatma@gmail.com | fatma123 |
| Patient | eya@gmail.com   | eya123   |

### Interface Médicale
URL : `http://localhost:4200/medical/login`

| Rôle       | Username    | Mot de passe   |
|------------|-------------|----------------|
| Secrétaire | secretaire1 | secretaire123  |
| Médecin (Fatma) | fatma  | fatma123       |
| Patient (Eya)   | eya    | eya123         |
| Patient    | patient1    | patient123     |

---

## Flux principal — Rendez-vous Eya → Consultation Fatma

1. **Eya** se connecte sur `/medical/login` (eya / eya123)
2. **Eya** va dans "Mes Rendez-vous" et prend un RDV chez Dr. Fatma Belhadj
3. **Fatma** se connecte sur `/login` (fatma@gmail.com / fatma123)
4. **Fatma** ouvre `Admin Dashboard → Consultations`
5. **Fatma voit le rendez-vous d'Eya** dans la liste des consultations ✅

---

## Modification apportée

Le seul fichier modifié est :

**`backend/src/api/routes/consultations.routes.js`**

L'endpoint `GET /api/consultations` agrège maintenant :
- Les consultations vidéo (système psychiatre - Projet 2)
- **Les rendez-vous médicaux (système médical - Projet 1)** ← nouveau

Les rendez-vous sont mappés au format consultation :
- `type: 'clinic'` 
- `status` : planifié→pending, confirmé→confirmed, annulé→cancelled, terminé→done
- `fullname` : prénom + nom du patient
