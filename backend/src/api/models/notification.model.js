module.exports = mongoose => {

    const schema =
    mongoose.Schema(

        {

            title: String,

            message: String,

            type: String,

            isRead: {
                type: Boolean,
                default: false
            }

        },

        {
            timestamps: true
        }

    );

    return mongoose.model(
        'notifications',
        schema
    );

};