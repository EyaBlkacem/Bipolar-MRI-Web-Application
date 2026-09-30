module.exports = app => {

    const router =
    require('express').Router();

    const dashboard =
    require('../controllers/dashboard.controller');

    // ====================================
    // HOME
    // ====================================

    router.get(

        '/dashboard/home',

        dashboard.getDashboardHome

    );

    app.use('/api', router);

};