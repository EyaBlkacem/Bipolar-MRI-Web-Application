// Modèle pour les rapports (psychiatre app)
// Converti de MySQL vers MongoDB
module.exports = mongoose => {
    const Schema = mongoose.Schema;

    let ReportSchema = new Schema({
        user_id:         { type: Schema.Types.ObjectId, ref: 'BipolarUser', required: true },
        form_id:         { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
        risk_level:      { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
        diagnosis:       { type: String, default: '' },
        recommendations: { type: String, default: '' }
    }, { timestamps: true });

    ReportSchema.method('toJSON', function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Report = mongoose.model('Report', ReportSchema);
    return Report;
};
