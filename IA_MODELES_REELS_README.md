# Intégration réelle des 2 modèles IA

Ce projet contient maintenant les vrais fichiers fournis :

- `ai-service/models/bipolar_model.pkl`
- `ai-service/models/scaler.pkl`
- `ai-service/models/irm_model.h5`

## Architecture

```txt
Angular Patient/Admin
        ↓
Backend Node.js / Express / MongoDB
        ↓
AI Service Python Flask
        ↓
bipolar_model.pkl + irm_model.h5
```

## Workflow patient

1. Patient ouvre `Test IA Bipolaire`.
2. Il remplit le questionnaire.
3. Node envoie les réponses vers le service Python.
4. Python lance le vrai `bipolar_model.pkl`.
5. Si risque faible/modéré : dossier transmis directement au docteur.
6. Si risque élevé : le patient doit uploader une IRM.
7. Python lance le vrai `irm_model.h5`.
8. Résultat + rapport IA sont visibles côté admin dans `Assessments`.

## Lancement obligatoire

### 1. Lancer MongoDB

Vérifie que MongoDB est lancé.

### 2. Lancer le service IA Python

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Tester dans le navigateur :

```txt
http://localhost:5001/health
```

Tu dois voir :

```json
{
  "formModelLoaded": true,
  "mriModelLoaded": true
}
```

### 3. Lancer backend Node

```bash
cd backend
npm install
npm start
```

### 4. Lancer frontend Angular

```bash
cd frontend
npm install
ng serve
```

## Pages à tester

### Patient

```txt
/medical/patient/ai-assessment
```

### Admin

```txt
/admin-dashboard/assessments
```

## Remarque importante

Le fichier `bipolar_model.pkl` est un pipeline imblearn contenant déjà :

- StandardScaler
- SMOTE
- GradientBoostingClassifier

Donc `scaler.pkl` est conservé dans le projet, mais le backend ne l’applique pas deux fois.
