module.exports = mongoose => {
    const Schema = mongoose.Schema;

    let AssessmentSchema = new Schema({
        patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
        date: { type: Date, default: Date.now },

        // Humeur (1-10)
        humeur: { type: Number, min: 1, max: 10, required: true },

        // Sommeil
        heureSommeil: { type: Number, min: 0, max: 24, required: true }, // heures de sommeil
        qualiteSommeil: { type: String, enum: ['mauvaise', 'moyenne', 'bonne', 'excellente'], required: true },

        // Énergie (1-10)
        energie: { type: Number, min: 1, max: 10, required: true },

        // Anxiété (1-10)
        anxiete: { type: Number, min: 1, max: 10, required: true },

        // Irritabilité (1-10)
        irritabilite: { type: Number, min: 1, max: 10, required: true },

        // Pensées rapides
        penseesRapides: { type: Boolean, default: false },

        // Prise de médicaments
        medicamentsPris: { type: Boolean, default: true },

        // Notes libres
        notes: { type: String, default: '' }
    }, { timestamps: true });

    AssessmentSchema.method('toJSON', function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Assessment = mongoose.model('Assessment', AssessmentSchema);
    return Assessment;
};
