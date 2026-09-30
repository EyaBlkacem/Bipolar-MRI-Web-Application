module.exports = mongoose => {
    const Schema = mongoose.Schema;

    let MessageSchema = new Schema({
        from:     { type: String, required: true },
        to:       { type: String, required: true },
        fromName: { type: String },
        message:  { type: String, required: true },
        lu:       { type: Boolean, default: false }
    }, { timestamps: true });

    MessageSchema.method('toJSON', function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Message = mongoose.model('Message', MessageSchema);
    return Message;
};