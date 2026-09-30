module.exports = app => {
    const router = require('express').Router();
    const medecinController = require('../controllers/medecin.controller');

    router.post('/medecins',         medecinController.create);
    router.get('/medecins',          medecinController.findAll);
    router.get('/medecins/:id',      medecinController.findOne);
    router.put('/medecins/:id',      medecinController.update);
    router.delete('/medecins/:id',   medecinController.delete);

    app.use('/api', router);
};
