const db = require('../../database/db.config');
const User    = db.users;
const Patient = db.patients;
const Medecin = db.medecins;


exports.register = async (req, res) => {
    const { nom, prenom, username, password, role,
            telephone, email, adresse, sexe, dateNaissance,
            specialite } = req.body;

    if (!nom || !prenom || !username || !password || !role) {
        return res.status(400).send({ message: 'Champs obligatoires manquants' });
    }

    try {
        
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).send({ message: 'Identifiant déjà utilisé' });
        }

        let patientId = null;
        let medecinId = null;

       
        if (role === 'patient') {
            const newPatient = new Patient({
                nom, prenom,
                cin: `CIN-${Date.now()}`,
                dateNaissance: dateNaissance || new Date('1990-01-01'),
                telephone: telephone || '00000000',
                email: email || '',
                adresse: adresse || '',
                sexe: sexe || 'Homme',
                actif: true
            });
            const savedPatient = await newPatient.save();
            patientId = savedPatient._id;
        }

        if (role === 'medecin') {
            const newMedecin = new Medecin({
                nom, prenom,
                specialite: specialite || 'Psychiatrie générale',
                telephone: telephone || '00000000',
                email: email || '',
                adresse: adresse || '',
                actif: true
            });
            const savedMedecin = await newMedecin.save();
            medecinId = savedMedecin._id;
        }

        const newUser = new User({
            nom, prenom, username, password, role,
            patientId, medecinId
        });

        const saved = await newUser.save();

        
        const populated = await User.findById(saved._id)
            .populate('patientId')
            .populate('medecinId');

        res.status(201).send(populated);

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: 'Identifiant et mot de passe requis' });
    }

    try {
        const user = await User.findOne({ username, password })
            .populate('patientId')
            .populate('medecinId');

        if (!user) {
            return res.status(401).send({ message: 'Identifiants incorrects' });
        }

        res.send(user);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


exports.findAll = (req, res) => {
    User.find()
        .populate('patientId', 'nom prenom')
        .populate('medecinId', 'nom prenom specialite')
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};


exports.updateUser = async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        );
        res.send(updated);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};