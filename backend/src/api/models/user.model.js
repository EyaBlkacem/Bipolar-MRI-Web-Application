module.exports = mongoose => {
    const Schema = mongoose.Schema;

    let UserSchema = new Schema({
        nom:       { type: String, required: true },
        prenom:    { type: String, required: true },
        username:  { type: String, required: true, unique: true },
        password:  { type: String, required: true },
        role:      { type: String, enum: ['patient', 'medecin', 'secretaire'], required: true },
        patientId: { type: Schema.Types.ObjectId, ref: 'Patient', default: null },
        medecinId: { type: Schema.Types.ObjectId, ref: 'Medecin',  default: null },
    }, { timestamps: true });

    UserSchema.method('toJSON', function () {
        const { __v, _id, password, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const User = mongoose.model('User', UserSchema);
    return User;
};