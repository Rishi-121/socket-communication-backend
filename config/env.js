require("dotenv").config();

module.exports = {
    PORT: process.env.PORT,
    MONGO_ATLAS_URI: process.env.MONGO_ATLAS_URI,
    JWT_SECRET: process.env.JWT_SECRET,
}