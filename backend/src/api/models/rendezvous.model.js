module.exports = mongoose => {

    const schema =
    mongoose.Schema(

        {

            patient: {
                type: String,
                required: true
            },

            medecin: {
                type: String,
                required: true
            },

            date: {
                type: String,
                required: true
            },

            heure: {
                type: String,
                required: true
            },

            motif: {
                type: String,
                default: ''
            },

            status: {
                type: String,
                default: 'pending'
            }

        },

        {
            timestamps: true
        }

    );

    return mongoose.model(
        'rendezvous',
        schema
    );

};