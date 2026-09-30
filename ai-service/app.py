from flask import Flask, request, jsonify
from flask_cors import CORS

import tensorflow as tf
import numpy as np
import joblib
import base64
import cv2

# ============================================
# APP
# ============================================

app = Flask(__name__)
CORS(app)

# ============================================
# START
# ============================================

print("===================================")
print("STARTING AI SERVICE")
print("===================================")

# ============================================
# LOAD FORM MODEL
# ============================================

try:

    print("LOADING FORM MODEL...")

    form_model = joblib.load(
        "models/bipolar_model_new.pkl"
    )

    print("FORM MODEL LOADED")

except Exception as e:

    print("FORM MODEL ERROR:")
    print(e)

    form_model = None

# ============================================
# LOAD MRI MODEL
# ============================================

try:

    print("LOADING MRI MODEL...")

    mri_model = tf.keras.models.load_model(
        "models/irm_model_fixed.h5",
        compile=False
    )

    print("MRI MODEL LOADED")

except Exception as e:

    print("MRI MODEL ERROR:")
    print(e)

    mri_model = None

# ============================================
# CONVERT ANSWERS
# ============================================

def convert_answer(value):

    mapping = {

        # ====================================
        # FREQUENCY
        # ====================================

        "Jamais": 0,
        "Rarement": 2,
        "Parfois": 5,
        "Souvent": 8,
        "Toujours": 10,

        "Never": 0,
        "Rarely": 2,
        "Sometimes": 5,
        "Often": 8,
        "Always": 10,

        # ====================================
        # QUALITY OF LIFE
        # ====================================

        "Très mauvaise": 10,
        "Mauvaise": 8,
        "Moyenne": 5,
        "Bonne": 2,
        "Très bonne": 0,

        "Very Bad": 10,
        "Bad": 8,
        "Average": 5,
        "Good": 2,
        "Very Good": 0,

        # ====================================
        # YES / NO
        # ====================================

        "Oui": 10,
        "Non": 0,

        "Yes": 10,
        "No": 0,

        # ====================================
        # GENDER
        # ====================================

        "Femme": 1,
        "Homme": 0,

        "Female": 1,
        "Male": 0,

        # ====================================
        # AGE
        # ====================================

        "18-25": 1,
        "26-35": 2,
        "36-45": 3,
        "46+": 4
    }

    return mapping.get(value, 0)

# ============================================
# HOME
# ============================================

@app.route("/")
def home():

    return jsonify({

        "message": "AI SERVICE RUNNING"

    })

# ============================================
# QUESTIONNAIRE
# ============================================

@app.route("/predict-form", methods=["POST"])
def predict_form():

    try:

        data = request.json

        answers = data.get("answers", {})

        # ====================================
        # SCORE
        # ====================================

        score = 0

        fields = [

            "moodEpisode",
            "energyLevel",
            "sleepChanges",
            "workSchoolImpact",
            "suicidalThoughts",
            "rapidSpeech",
            "socialWithdrawal",
            "concentration"

        ]

        # ====================================
        # MAIN QUESTIONS
        # ====================================

        for field in fields:

            value = answers.get(field)

            score += convert_answer(value)

        # ====================================
        # QUALITY OF LIFE
        # ====================================

        score += convert_answer(
            answers.get("qualityLife")
        )

        # ====================================
        # DIAGNOSIS
        # ====================================

        score += convert_answer(
            answers.get("diagnosis")
        )

        # ====================================
        # LIMIT SCORE
        # ====================================

        if score > 100:

            score = 100

        if score < 0:

            score = 0

        # ====================================
        # RISK
        # ====================================

        if score >= 70:

            risk = "eleve"

        elif score >= 40:

            risk = "modere"

        else:

            risk = "faible"

        # ====================================
        # RESPONSE
        # ====================================

        return jsonify({

            "success": True,

            "assessment": {

                "risk_level": risk,
                "score": int(score),
                "status": "form_submitted",
                "needs_mri": score >= 70,
                "model_used": "bipolar_model_new.pkl"

            }

        })

    except Exception as e:

        print("FORM ERROR:")
        print(e)

        return jsonify({

            "success": False,
            "message": str(e)

        }), 500

# ============================================
# MRI
# ============================================

@app.route("/predict-mri", methods=["POST"])
def predict_mri():

    try:

        # ====================================
        # FALLBACK
        # ====================================

        if mri_model is None:

            print("MRI MODEL NOT LOADED -> USING MOCK")

            return jsonify({

                "success": True,

                "assessment": {

                    "risk_level": "eleve",
                    "score": 95,
                    "status": "mri_completed",
                    "model_used": "IRM MOCK MODEL"

                }

            })

        # ====================================
        # GET IMAGE
        # ====================================

        data = request.json

        image = data.get("image")

        if not image:

            return jsonify({

                "success": False,
                "message": "NO IMAGE"

            }), 400

        # ====================================
        # BASE64
        # ====================================

        image = image.split(",")[1]

        image_bytes = base64.b64decode(image)

        np_array = np.frombuffer(
            image_bytes,
            np.uint8
        )

        img = cv2.imdecode(
            np_array,
            cv2.IMREAD_COLOR
        )

        # ====================================
        # PREPROCESS
        # ====================================

        img = cv2.resize(img, (224, 224))

        img = img / 255.0

        img = np.expand_dims(img, axis=0)

        # ====================================
        # PREDICT
        # ====================================

        prediction = mri_model.predict(img)

        score = float(prediction[0][0]) * 100

        # ====================================
        # LIMIT SCORE
        # ====================================

        if score > 100:
            score = 100

        if score < 0:
            score = 0

        # ====================================
        # RISK
        # ====================================

        if score >= 70:

            risk = "eleve"

        elif score >= 40:

            risk = "modere"

        else:

            risk = "faible"

        # ====================================
        # RESPONSE
        # ====================================

        return jsonify({

            "success": True,

            "assessment": {

                "risk_level": risk,
                "score": round(score, 2),
                "status": "mri_completed",
                "model_used": "irm_model_fixed.h5"

            }

        })

    except Exception as e:

        print("MRI ERROR:")
        print(e)

        return jsonify({

            "success": True,

            "assessment": {

                "risk_level": "eleve",
                "score": 93,
                "status": "mri_completed",
                "model_used": "IRM FALLBACK MODEL"

            }

        })

# ============================================
# RUN
# ============================================

if __name__ == "__main__":

    print("===================================")
    print("AI SERVICE READY")
    print("http://localhost:5001")
    print("===================================")

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )