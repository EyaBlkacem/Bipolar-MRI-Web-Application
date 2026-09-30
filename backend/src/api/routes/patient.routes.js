module.exports = app => {

    const router =
    require('express').Router();

    const patientController =
    require('../controllers/patient.controller');

    // =====================================
    // FULL DYNAMIC DATA
    // =====================================

    router.get(
        '/patients/full-data',
        patientController.getFullPatientsData
    );

    // =====================================
    // RECENT ACTIVITIES
    // =====================================

    router.get(
        '/patients/recent-activities',
        patientController.getRecentActivities
    );

    // =====================================
    // CRITICAL ALERTS
    // =====================================

    router.get(
        '/patients/critical-alerts',
        patientController.getCriticalAlerts
    );

    // =====================================
    // CRUD
    // =====================================

    router.post(
        '/patients',
        patientController.create
    );

    router.get(
        '/patients',
        patientController.findAll
    );

    // IMPORTANT
    // TOUJOURS METTRE :id A LA FIN
    // =====================================

    router.get(
        '/patients/:id',
        patientController.findOne
    );

    router.put(
        '/patients/:id',
        patientController.update
    );

    router.delete(
        '/patients/:id',
        patientController.delete
    );

    // =====================================
    // APP
    // =====================================

    app.use('/api', router);

};