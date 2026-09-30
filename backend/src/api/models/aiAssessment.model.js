module.exports = mongoose => {
  const Schema = mongoose.Schema;

  const AiAssessmentSchema = new Schema({
    patientId: { type: Schema.Types.ObjectId, ref: 'BipolarUser', default: null },
    patientName: { type: String, default: '' },
    patientEmail: { type: String, default: '' },
    doctorId: { type: Schema.Types.ObjectId, ref: 'BipolarUser', default: null },

    formAnswers: { type: Object, default: {} },
    formRiskScore: { type: Number, default: 0 },
    formRiskLevel: { type: String, enum: ['faible', 'modere', 'eleve'], default: 'faible' },
    formPrediction: { type: String, default: '' },
    formProbability: { type: Number, default: null },
    formModelPrediction: { type: Number, default: null },
    formFeatureVector: { type: [Number], default: [] },
    formModelSource: { type: String, default: 'bipolar_model.pkl' },
    requiresMRI: { type: Boolean, default: false },

    mri: {
      fileName: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      dataUrl: { type: String, default: '' },
      aiScore: { type: Number, default: null },
      probability: { type: Number, default: null },
      classIndex: { type: Number, default: null },
      risk: { type: String, default: '' },
      prediction: { type: String, default: '' },
      modelSource: { type: String, default: 'irm_model.h5' },
      rawPrediction: { type: Object, default: [] }
    },

    status: {
      type: String,
      enum: ['form_submitted', 'waiting_mri', 'mri_submitted', 'reviewed'],
      default: 'form_submitted'
    },

    reportText: { type: String, default: '' }
  }, { timestamps: true });

  AiAssessmentSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  return mongoose.model('AiAssessment', AiAssessmentSchema);
};
