const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { user } = require("../utils/roles");

const bcryptSalt = 10;

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, lowercase: true },
        lastName: { type: String, required: true, lowercase: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        role: { type: String, default: user },
    },
    { timestamps: true }
);

// validate user's password
userSchema.methods.validatePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// encrypt password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const hashedPassword = await bcrypt.hash(this.password, bcryptSalt);
    this.password = hashedPassword;
    next();
});

module.exports = mongoose.model("User", userSchema);
