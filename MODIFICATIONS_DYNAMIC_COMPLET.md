# Modifications réalisées - version dynamique

Cette version corrige les points urgents suivants :

## Backend MongoDB / Express
- Rendez-vous psychiatre dynamiques avec `patient_id`, `doctor_id`, `type` (`online` ou `clinic`), `roomId`, `status`.
- Ajout de `/api/appointments/patient/:id` pour l'espace patient.
- Ajout de `/api/doctors/admins` pour que le patient choisisse l'admin/psychiatre.
- Consultations alimentées par les vrais rendez-vous online + consultations créées.
- Suppression consultation corrigée : `DELETE /api/consultations/:id`.
- Messages realtime corrigés avec Socket.IO : événements unifiés `send-message` et `receive-message`.
- Présence online/offline via `online-users`.
- WebRTC signaling corrigé : `join-room`, `offer`, `answer`, `ice-candidate`.

## Frontend Angular
- Correction du service Socket.IO : URL `http://localhost:3000` au lieu de l'ancienne IP invalide.
- Messages admin dynamiques : liste patients, conversation, realtime, statut online/offline.
- Nouvelle page patient Messages : `/medical/patient/messages`.
- Page patient Rendez-vous rendue dynamique sur le modèle psychiatre MongoDB : création RDV, choix admin, type online/présentiel, annulation, rejoindre vidéo.
- Consultation vidéo rendue fonctionnelle avec WebRTC + Socket.IO.
- Sidebar patient mise à jour avec lien Messages.
- Correction `appointments.component.ts` : style CSS correct + statut `done`.

## Lancement
Backend :
```bash
cd backend
npm install
npm start
```

Frontend :
```bash
cd frontend
npm install
ng serve
```

MongoDB doit être lancé avant le backend.

## Comptes
L'email admin défini dans le backend est actuellement : `fatma@gmail.com`.
Créer/seed un compte avec cet email pour avoir le rôle admin.
