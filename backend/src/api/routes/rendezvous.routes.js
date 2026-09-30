module.exports = app => {

    const router =
    require('express').Router();

    const rendezvous =
    require('../controllers/rendezvous.controller');

    router.post(
        '/',
        rendezvous.create
    );

    router.get(
        '/',
        rendezvous.findAll
    );

    router.get(
        '/patient/:patientId',
        rendezvous.findByPatient
    );

    router.get(
        '/:id',
        rendezvous.findOne
    );

    router.put(
        '/:id',
        rendezvous.update
    );

    router.delete(
        '/:id',
        rendezvous.delete
    );

    app.use(
        '/api/rendezvous',
        router
    );

};