// Modèle pour les utilisateurs de l'app psychiatre (bipolar_app)
// Converti de MySQL vers MongoDB
module.exports = mongoose => {
    const Schema = mongoose.Schema;

    let BipolarUserSchema = new Schema({
        fullname:  { type: String, required: true },
        email:     { type: String, required: true, unique: true },
        password:  { type: String, required: true },
        phone:     { type: String, default: null },
        role:      { type: String, enum: ['admin', 'user', 'blocked'], default: 'user' }
    }, { timestamps: true });

    BipolarUserSchema.method('toJSON', function () {
        const { __v, _id, password, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const BipolarUser = mongoose.model('BipolarUser', BipolarUserSchema);
    return BipolarUser;
};
