module.exports = mongoose => {
    const Schema = mongoose.Schema;

    let PatientSchema = new Schema({
        nom:        { type: String, required: true },
        prenom:     { type: String, required: true },
        cin:        { type: String, required: true, unique: true },
        dateNaissance: { type: Date, required: true },
        telephone:  { type: String, required: true },
        email:      { type: String },
        adresse:    { type: String },
        sexe:       { type: String, enum: ['Homme', 'Femme'], required: true },
        actif:      { type: Boolean, default: true }
    }, { timestamps: true });

    PatientSchema.method('toJSON', function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Patient = mongoose.model('Patient', PatientSchema);
    return Patient;
};
