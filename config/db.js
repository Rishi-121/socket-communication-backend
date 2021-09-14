const ENV = require("./env");
const mongoose = require("mongoose");

module.exports = async () => {
    try {

        const conn = await mongoose.connect(ENV.MONGO_ATLAS_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};
