const ENV = require("../config/env");
const jwt = require("jsonwebtoken");

module.exports.generateToken = (user) => {
    const { _id, firstName, lastName, email, role } = user;

    return jwt.sign({ _id, firstName, lastName, email, role }, ENV.JWT_SECRET , {
        expiresIn: role === "user" ? "7 days" : "24h",
    });
};

