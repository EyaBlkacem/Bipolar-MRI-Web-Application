module.exports = mongoose => {
    const Schema = mongoose.Schema;

    let MedecinSchema = new Schema({
        nom:        { type: String, required: true },
        prenom:     { type: String, required: true },
        specialite: { type: String, required: true },
        telephone:  { type: String, required: true },
        email:      { type: String },
        actif:      { type: Boolean, default: true }
    }, { timestamps: true });

    MedecinSchema.method('toJSON', function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Medecin = mongoose.model('Medecin', MedecinSchema);
    return Medecin;
};
