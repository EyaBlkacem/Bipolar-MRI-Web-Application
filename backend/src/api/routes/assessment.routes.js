module.exports = app => {

    const router =
    require('express').Router();

    const ctrl =
    require('../controllers/assessment.controller');

    // ====================================
    // CREATE ASSESSMENT
    // ====================================

    router.post(

        '/assessments',

        ctrl.create

    );

    // ====================================
    // GET ALL ASSESSMENTS
    // ====================================

    router.get(

        '/assessments',

        ctrl.findAll

    );

    // ====================================
    // GET PATIENT ASSESSMENTS
    // ====================================

    router.get(

        '/assessments/patient/:patientId',

        ctrl.findByPatient

    );

    // ====================================
    // GET ONE ASSESSMENT
    // ====================================

    router.get(

        '/assessments/:id',

        ctrl.findOne

    );

    // ====================================
    // DELETE ASSESSMENT
    // ====================================

    router.delete(

        '/assessments/:id',

        ctrl.delete

    );

    // ====================================
    // API
    // ====================================

    app.use(

        '/api',

        router

    );

};