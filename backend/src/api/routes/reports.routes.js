// Routes Reports - converti MySQL -> MongoDB
module.exports = app => {
    const router = require('express').Router();
    const db = require('../../database/db.config');
    const Report = db.reports;
    const Assessment = db.assessments;

    // POST create report
    router.post('/reports', async (req, res) => {
        try {
            const { form_id, diagnosis, recommendations } = req.body;

            if (!form_id) {
                return res.status(400).json({ message: 'form_id is required' });
            }

            const assessment = await Assessment.findById(form_id);
            if (!assessment) {
                return res.status(404).json({ message: 'Form not found' });
            }

            // Calcul du risque basé sur les scores
            const score = (assessment.humeur || 5) + (assessment.energie || 5) - (assessment.anxiete || 5) - (assessment.irritabilite || 5);
            let risk_level = 'low';
            if (score < -5) risk_level = 'high';
            else if (score < 0) risk_level = 'medium';

            const report = new Report({
                user_id: assessment.patientId,
                form_id,
                risk_level,
                diagnosis: diagnosis || '',
                recommendations: recommendations || ''
            });
            await report.save();

            res.json({
                message: 'Report created',
                id: report._id,
                risk_level
            });
        } catch (error) {
            console.error('REPORT ERROR:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    });

    // GET all reports
    router.get('/reports', async (req, res) => {
        try {
            const reports = await Report.find()
                .populate('user_id', 'fullname email')
                .populate('form_id')
                .sort({ createdAt: -1 });
            res.json(reports);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    });


    // DELETE report
    router.delete('/reports/:id', async (req, res) => {
        try {
            await Report.findByIdAndDelete(req.params.id);
            res.json({ message: 'Report deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    });

    app.use('/api', router);
};
// Already done in main file - extra export just in case
