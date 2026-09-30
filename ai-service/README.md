# AI Service réel - Bipolarité + IRM

Ce service charge les vrais fichiers fournis :

- `models/bipolar_model.pkl`
- `models/scaler.pkl`
- `models/irm_model.h5`

## Lancement

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Le service démarre sur :

```txt
http://localhost:5001
```

Tester :

```txt
http://localhost:5001/health
```

## Endpoints

- `POST /predict-form`
- `POST /predict-mri`

Le backend Node appelle ce service automatiquement.
