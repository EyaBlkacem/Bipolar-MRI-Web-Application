// Modèle pour les consultations vidéo (psychiatre app)
// Converti de MySQL vers MongoDB
module.exports = mongoose => {
    const Schema = mongoose.Schema;

    let ConsultationSchema = new Schema({
        patient_id: { type: Schema.Types.ObjectId, ref: 'BipolarUser', required: true },
        doctor_id:  { type: Schema.Types.ObjectId, ref: 'BipolarUser', required: true },
        roomId:     { type: String, required: true },
        type:       { type: String, enum: ['online', 'clinic'], default: 'online' },
        status:     { type: String, enum: ['active', 'ended'], default: 'active' }
    }, { timestamps: true });

    ConsultationSchema.method('toJSON', function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Consultation = mongoose.model('Consultation', ConsultationSchema);
    return Consultation;
};
