# Intégration des 2 modèles IA

## Ce qui a été ajouté

### Patient
Route : `/medical/patient/ai-assessment`

Le patient remplit un questionnaire clinique. Le backend calcule un score de risque selon les symptômes pré-diagnostic, inspiré du notebook `Bipolar_Detection_formulaire.ipynb`.

- Risque faible/modéré : les réponses sont directement transmises au docteur.
- Risque élevé : l'application demande au patient d'uploader une image IRM.
- Après upload IRM : le deuxième modèle IA renvoie une prédiction image et les données sont transmises au docteur.

### Docteur / Admin
Route : `/admin-dashboard/assessments`

Le docteur voit :
- patient
- score questionnaire
- niveau de risque
- IRM demandée ou non
- image IRM si uploadée
- prédiction IRM
- rapport IA généré

## Backend ajouté

- `backend/src/api/models/aiAssessment.model.js`
- `backend/src/api/routes/aiAssessment.routes.js`

Endpoints :

- `POST /api/ai/assessment-form`
- `POST /api/ai/assessment-mri/:id`
- `GET /api/ai/assessments`
- `GET /api/ai/assessments/patient/:patientId`
- `PUT /api/ai/assessments/:id/report`

## Important

La version intégrée est une version web démonstration stable pour la soutenance.
Elle reproduit la logique métier des notebooks :

- questionnaire : modèle de risque clinique basé sur symptômes
- IRM : pipeline image inspiré EfficientNet du notebook IRM

Pour une vraie exécution TensorFlow du fichier `.keras`, il faudra ajouter un microservice Python Flask/FastAPI et appeler ce microservice depuis Node.js.
