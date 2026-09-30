module.exports = app => {

  const router = require('express').Router();
  const db = require('../../database/db.config');

  const AiAssessment = db.aiAssessments;
  const BipolarUser = db.bipolarUsers;

  const AI_SERVICE_URL =
    process.env.AI_SERVICE_URL || 'http://localhost:5001';

  // =====================================================
  // CALL AI SERVICE
  // =====================================================

  async function callAiService(path, payload) {

    const response = await fetch(
      `${AI_SERVICE_URL}${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload || {})
      }
    );

    const data = await response.json();

    if (!response.ok) {

      throw new Error(
        data.message || 'AI service error'
      );

    }

    return data;
  }

  // =====================================================
  // REPORT
  // =====================================================

  function buildReport(assessment) {

    return `
RAPPORT IA BIPOLARITÉ

Patient :
${assessment.patientName}

Email :
${assessment.patientEmail}

==================================

Risque Questionnaire :
${assessment.formRiskLevel}

Score :
${assessment.formRiskScore}/100

Modèle :
${assessment.formModelSource}

==================================

IRM :
${assessment.mri?.prediction || 'Non analysée'}

Score IRM :
${assessment.mri?.aiScore || 'N/A'}

==================================

Décision :
${assessment.requiresMRI
  ? 'IRM demandée'
  : 'Transmission directe au psychiatre'}

`;
  }

  // =====================================================
  // HEALTH
  // =====================================================

  router.get('/ai/health', async (req, res) => {

    try {

      const response = await fetch(
        `${AI_SERVICE_URL}/`
      );

      const data = await response.json();

      res.json(data);

    } catch (error) {

      res.status(500).json({

        message: 'AI service offline',
        error: error.message

      });

    }

  });

  // =====================================================
  // QUESTIONNAIRE
  // =====================================================

  router.post('/ai/assessment-form', async (req, res) => {

    try {

      const {

        patientId,
        doctorId,
        patientName,
        patientEmail,
        answers

      } = req.body;

      // ==========================================
      // GET PATIENT
      // ==========================================

      let patient = null;

      if (patientId) {

        try {

          patient =
            await BipolarUser.findById(patientId);

        } catch (_) {}

      }

      // ==========================================
      // AI CALL
      // ==========================================

      const result = await callAiService(

        '/predict-form',

        {
          answers: answers || {}
        }

      );

      // ==========================================
      // CREATE ASSESSMENT
      // ==========================================

      const assessment = new AiAssessment({

        patientId:
          patientId || null,

        doctorId:
          doctorId || null,

        patientName:
          patient?.fullname ||
          patient?.nom ||
          patientName ||
          'Patient',

        patientEmail:
          patient?.email ||
          patientEmail ||
          '',

        formAnswers:
          answers || {},

        // SCORE NUMERIQUE
        formRiskScore:
          Number(result.assessment.score || 0),

        // TEXTE
        formRiskLevel:
          result.assessment.risk_level || 'faible',

        // TEXTE
        formPrediction:
          result.assessment.risk_level || 'faible',

        formProbability:
          null,

        // IMPORTANT → NUMBER
        formModelPrediction:
          Number(result.assessment.score || 0),

        formFeatureVector:
          [],

        formModelSource:
          result.assessment.model_used ||
          'bipolar_model_new.pkl',

        requiresMRI:
          !!result.assessment.needs_mri,

        status:
          result.assessment.needs_mri
            ? 'waiting_mri'
            : 'form_submitted'

      });

      // ==========================================
      // REPORT
      // ==========================================

      assessment.reportText =
        buildReport(assessment);

      await assessment.save();

      // ==========================================
      // RESPONSE
      // ==========================================

      res.json({

        message:
          'Assessment saved',

        assessment

      });

    } catch (error) {

      console.error(
        'AI assessment form error:',
        error
      );

      res.status(500).json({

        message:
          'Erreur modèle questionnaire',

        error:
          error.message

      });

    }

  });

  // =====================================================
  // MRI
  // =====================================================

  router.post('/ai/assessment-mri/:id', async (req, res) => {

    try {

      const assessment =
        await AiAssessment.findById(
          req.params.id
        );

      if (!assessment) {

        return res.status(404).json({

          message:
            'Assessment not found'

        });

      }

      const {

        fileName,
        mimeType,
        dataUrl

      } = req.body;

      // ==========================================
      // AI MRI
      // ==========================================

      const result = await callAiService(

        '/predict-mri',

        {
          image: dataUrl
        }

      );

      // ==========================================
      // SAVE MRI
      // ==========================================

      assessment.mri = {

        fileName:
          fileName || 'irm-upload',

        mimeType:
          mimeType || '',

        dataUrl:
          dataUrl || '',

        aiScore:
          Number(result.assessment.score || 0),

        probability:
          null,

        classIndex:
          null,

        risk:
          result.assessment.risk_level || 'faible',

        prediction:
          result.assessment.risk_level || 'faible',

        modelSource:
          result.assessment.model_used ||
          'irm_model.h5',

        rawPrediction:
          []

      };

      assessment.status =
        'mri_submitted';

      assessment.reportText =
        buildReport(assessment);

      await assessment.save();

      // ==========================================
      // RESPONSE
      // ==========================================

      res.json({

        message:
          'MRI analysed',

        assessment

      });

    } catch (error) {

      console.error(
        'AI MRI error:',
        error
      );

      res.status(500).json({

        message:
          'Erreur modèle IRM',

        error:
          error.message

      });

    }

  });

  // =====================================================
  // GET ALL
  // =====================================================

  router.get('/ai/assessments', async (req, res) => {

    try {

      const assessments =
        await AiAssessment.find()
          .sort({ createdAt: -1 });

      res.json(assessments);

    } catch (error) {

      res.status(500).json({

        message:
          'Server error',

        error:
          error.message

      });

    }

  });

  // =====================================================
  // GET PATIENT
  // =====================================================

  router.get(
    '/ai/assessments/patient/:patientId',

    async (req, res) => {

      try {

        const assessments =
          await AiAssessment.find({

            patientId:
              req.params.patientId

          }).sort({

            createdAt: -1

          });

        res.json(assessments);

      } catch (error) {

        res.status(500).json({

          message:
            'Server error',

          error:
            error.message

        });

      }

    }
  );

  // =====================================================
  // REPORT UPDATE
  // =====================================================

  router.put(
    '/ai/assessments/:id/report',

    async (req, res) => {

      try {

        const assessment =
          await AiAssessment.findById(
            req.params.id
          );

        if (!assessment) {

          return res.status(404).json({

            message:
              'Assessment not found'

          });

        }

        assessment.reportText =
          req.body.reportText ||
          buildReport(assessment);

        assessment.status =
          'reviewed';

        await assessment.save();

        res.json({

          message:
            'Report updated',

          assessment

        });

      } catch (error) {

        res.status(500).json({

          message:
            'Server error',

          error:
            error.message

        });

      }

    }
  );

  // =====================================================
  // USE ROUTER
  // =====================================================

  app.use('/api', router);

};