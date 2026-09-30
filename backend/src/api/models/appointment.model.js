// Modèle pour les rendez-vous (psychiatre app) - MongoDB
module.exports = mongoose => {
    const Schema = mongoose.Schema;

    let AppointmentSchema = new Schema({
        patient_id:       { type: Schema.Types.ObjectId, ref: 'BipolarUser', required: true },
        doctor_id:        { type: Schema.Types.ObjectId, ref: 'BipolarUser', default: null },
        appointment_date: { type: Date, required: true },
        appointment_time: { type: String, required: true },
        type:             { type: String, enum: ['online', 'clinic'], default: 'online' },
        roomId:           { type: String, default: '' },
        status:           { type: String, enum: ['pending', 'confirmed', 'cancelled', 'done'], default: 'pending' },
        notes:            { type: String, default: '' }
    }, { timestamps: true });

    AppointmentSchema.pre('save', function(next) {
        if (!this.roomId) {
            this.roomId = `apt-${this.patient_id}-${Date.now()}`;
        }
        next();
    });

    AppointmentSchema.method('toJSON', function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Appointment = mongoose.model('Appointment', AppointmentSchema);
    return Appointment;
};
