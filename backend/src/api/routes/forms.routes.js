// Route /api/forms alias pour l'app psychiatre (mappe vers assessments)
module.exports = app => {
    const router = require('express').Router();
    const db = require('../../database/db.config');
    const Assessment = db.assessments;

    // GET all assessments (alias forms)
    router.get('/forms', async (req, res) => {
        try {
            const assessments = await Assessment.find().sort({ createdAt: -1 });
            res.json(assessments);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    });

    // POST create assessment (alias forms)
    router.post('/forms', async (req, res) => {
        try {
            const jwt = require('jsonwebtoken');
            const authHeader = req.headers['authorization'];
            let userId = null;
            if (authHeader) {
                try {
                    const token = authHeader.split(' ')[1];
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
                    userId = decoded.id;
                } catch(e) {}
            }

            const BipolarUser = db.bipolarUsers;
            // Create assessment linked to user
            const assessment = new Assessment({
                patientId: userId || req.body.patientId,
                humeur: req.body.humeur || 5,
                heureSommeil: req.body.heureSommeil || 7,
                qualiteSommeil: req.body.qualiteSommeil || 'moyenne',
                energie: req.body.energie || 5,
                anxiete: req.body.anxiete || 5,
                irritabilite: req.body.irritabilite || 5,
                penseesRapides: req.body.penseesRapides || false,
                medicamentsPris: req.body.medicamentsPris !== undefined ? req.body.medicamentsPris : true,
                notes: req.body.notes || ''
            });
            await assessment.save();
            res.json({ success: true, id: assessment._id });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    });

    app.use('/api', router);
};
