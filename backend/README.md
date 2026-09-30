# 🏥 Gestion de Rendez-vous Médicaux — Backend

> Projet Polytech Monastir — Node.js + Express + Mongoose + MongoDB

---

## 📁 Structure du projet

```
medical-backend/
├── .env
├── index.js                          ← Point d'entrée
├── package.json
├── seed.js                           ← Données de démonstration
└── src/
    ├── config/
    │   └── config.js                 ← Variables d'environnement
    ├── database/
    │   └── db.config.js              ← Connexion MongoDB
    └── api/
        ├── models/
        │   ├── patient.model.js
        │   ├── medecin.model.js
        │   └── rendezvous.model.js
        ├── controllers/
        │   ├── patient.controller.js
        │   ├── medecin.controller.js
        │   └── rendezvous.controller.js
        └── routes/
            ├── patient.routes.js
            ├── medecin.routes.js
            └── rendezvous.routes.js
```

---

## ⚙️ Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer le fichier .env
PORT=3000
DATABASE_URL=mongodb://0.0.0.0:27017/medical_db

# 3. Insérer les données de démonstration
node seed.js

# 4. Démarrer le serveur
npm start
# ou en mode développement
npm run dev
```

---

## 🔗 Routes API

### 👤 Patients — `/api/patients`

| Méthode | Route                 | Description                          |
|---------|-----------------------|--------------------------------------|
| POST    | `/api/patients`       | Créer un patient                     |
| GET     | `/api/patients`       | Liste tous les patients              |
| GET     | `/api/patients?search=ahmed` | Recherche par nom/prénom/CIN  |
| GET     | `/api/patients/:id`   | Détail d'un patient                  |
| PUT     | `/api/patients/:id`   | Modifier un patient                  |
| DELETE  | `/api/patients/:id`   | Supprimer un patient                 |

### 👨‍⚕️ Médecins — `/api/medecins`

| Méthode | Route                        | Description                     |
|---------|------------------------------|---------------------------------|
| POST    | `/api/medecins`              | Créer un médecin                |
| GET     | `/api/medecins`              | Liste tous les médecins         |
| GET     | `/api/medecins?specialite=x` | Filtrer par spécialité          |
| GET     | `/api/medecins/:id`          | Détail d'un médecin             |
| PUT     | `/api/medecins/:id`          | Modifier un médecin             |
| DELETE  | `/api/medecins/:id`          | Supprimer un médecin            |

### 📅 Rendez-vous — `/api/rendezvous`

| Méthode | Route                                 | Description                        |
|---------|---------------------------------------|------------------------------------|
| POST    | `/api/rendezvous`                     | Créer un rendez-vous               |
| GET     | `/api/rendezvous`                     | Liste tous les rendez-vous         |
| GET     | `/api/rendezvous?dateDebut=&dateFin=` | Filtrer par plage de dates         |
| GET     | `/api/rendezvous?patientId=&medecinId=&statut=` | Filtres combinés      |
| GET     | `/api/rendezvous/:id`                 | Détail d'un rendez-vous (populate) |
| GET     | `/api/rendezvous/patient/:patientId`  | RDV d'un patient                   |
| PUT     | `/api/rendezvous/:id`                 | Modifier un rendez-vous            |
| DELETE  | `/api/rendezvous/:id`                 | Supprimer un rendez-vous           |

---

## 🧪 Tests API avec Postman

### Créer un patient
```json
POST /api/patients
{
  "nom": "Ben Salah",
  "prenom": "Omar",
  "cin": "12345678",
  "dateNaissance": "1990-05-20",
  "telephone": "55123456",
  "email": "omar@gmail.com",
  "adresse": "Monastir",
  "sexe": "Homme"
}
```

### Créer un médecin
```json
POST /api/medecins
{
  "nom": "Gharbi",
  "prenom": "Amira",
  "specialite": "Cardiologie",
  "telephone": "71000010",
  "email": "a.gharbi@clinique.tn"
}
```

### Créer un rendez-vous
```json
POST /api/rendezvous
{
  "patient": "<ID_PATIENT>",
  "medecin": "<ID_MEDECIN>",
  "date": "2025-12-01",
  "heure": "10:00",
  "motif": "Consultation générale",
  "statut": "planifié",
  "notes": "Première visite"
}
```

### Filtrer les rendez-vous par date
```
GET /api/rendezvous?dateDebut=2025-11-01&dateFin=2025-12-31
```

### Rechercher un patient
```
GET /api/patients?search=ahmed
```

---

## 📋 Modèles de données

### Patient
| Champ         | Type    | Requis | Description         |
|---------------|---------|--------|---------------------|
| nom           | String  | ✅     |                     |
| prenom        | String  | ✅     |                     |
| cin           | String  | ✅     | Unique              |
| dateNaissance | Date    | ✅     |                     |
| telephone     | String  | ✅     |                     |
| email         | String  | ❌     |                     |
| adresse       | String  | ❌     |                     |
| sexe          | String  | ✅     | "Homme" ou "Femme"  |
| actif         | Boolean | ❌     | défaut: true        |

### Médecin
| Champ      | Type   | Requis |
|------------|--------|--------|
| nom        | String | ✅     |
| prenom     | String | ✅     |
| specialite | String | ✅     |
| telephone  | String | ✅     |
| email      | String | ❌     |

### RendezVous
| Champ   | Type     | Requis | Description                                      |
|---------|----------|--------|--------------------------------------------------|
| patient | ObjectId | ✅     | Référence Patient                                |
| medecin | ObjectId | ✅     | Référence Médecin                                |
| date    | Date     | ✅     | Ne peut pas être dans le passé                   |
| heure   | String   | ✅     | Format HH:MM                                     |
| motif   | String   | ✅     |                                                  |
| statut  | String   | ❌     | planifié / confirmé / annulé / terminé           |
| notes   | String   | ❌     |                                                  |

---

## ✅ Contraintes techniques respectées

- ✅ Node.js + Express + Mongoose + dotenv
- ✅ Architecture MVC claire (models / controllers / routes)
- ✅ Validation des champs obligatoires
- ✅ Validation des dates (pas de RDV dans le passé)
- ✅ Gestion d'erreurs avec codes HTTP appropriés
- ✅ Paramètres sensibles dans `.env`
- ✅ `populate()` patient/rendez-vous
- ✅ Recherche et filtrage avancé
- ✅ Jeu de données de démonstration (`seed.js`)
- ✅ CORS activé pour Angular
