const db = require('../../database/db.config');
const Medecin = db.medecins;

// Créer un médecin
exports.create = (req, res) => {
    const { nom, prenom, specialite, telephone, email } = req.body;

    if (!nom || !prenom || !specialite || !telephone) {
        return res.status(400).send({ message: 'Les champs obligatoires sont manquants' });
    }

    const newMedecin = new Medecin({ nom, prenom, specialite, telephone, email });

    newMedecin.save()
        .then(data => res.status(201).send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

// Récupérer tous les médecins
exports.findAll = (req, res) => {
    const specialite = req.query.specialite;
    let condition = {};

    if (specialite) {
        condition = { specialite: { $regex: specialite, $options: 'i' } };
    }

    Medecin.find(condition)
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

// Récupérer un médecin par ID
exports.findOne = (req, res) => {
    const id = req.params.id;

    Medecin.findById(id)
        .then(data => {
            if (!data) return res.status(404).send({ message: 'Médecin non trouvé' });
            res.send(data);
        })
        .catch(err => res.status(500).send({ message: err.message }));
};

// Modifier un médecin
exports.update = (req, res) => {
    const id = req.params.id;

    Medecin.findByIdAndUpdate(id, req.body, { useFindAndModify: false, new: true })
        .then(data => {
            if (!data) return res.status(404).send({ message: 'Médecin non trouvé' });
            res.send({ message: 'Médecin mis à jour avec succès', data });
        })
        .catch(err => res.status(500).send({ message: err.message }));
};

// Supprimer un médecin
exports.delete = (req, res) => {
    const id = req.params.id;

    Medecin.findByIdAndDelete(id)
        .then(data => {
            if (!data) return res.status(404).send({ message: 'Médecin non trouvé' });
            res.send({ message: 'Médecin supprimé avec succès' });
        })
        .catch(err => res.status(500).send({ message: err.message }));
};
