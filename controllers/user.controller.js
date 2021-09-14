const Roles = require("../utils/roles");
const User = require("../models/user.model");
const { authSchema } = require("../validator/joi");
const { generateToken } = require("../utils/jwt");

const bcryptSalt = 10;

/////////// Register a new user/admin ///////////
const register = async (req, res, role) => {
    try {

        await authSchema.validateAsync(req.body);

        const userExists = await User.findOne({ email: req.body.email });

        if (userExists) {
            return res.status(409).json({
                message: "Account already exists",
                success: false,
            });
        }

        const user = await new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            role: role || Roles.user,
        });

        await user.save();

        return res.status(201).json({
            message: "Account created successfully",
            success: true,
            token: generateToken(user),
        });
    }
    catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};


/////////// Auth user and generate token ///////////
const login = async (req, res) => {
    try {

        if (!validateEmail(req.body.email)) {

            return res.status(422).json({
                message: "Unsupported email",
                success: false,
            });

        }

        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                message: "Account not found",
                success: false,
            });
        }

        const isMatch = await user.validatePassword(req.body.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid contact email or password",
                success: false,
            });
        }

        return res.status(200).json({
            message: "You're Successfully logged in",
            success: true,
            token: generateToken(user),
        });

    }
    catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

//////////// Update account /////////////
const updateAccount = async (req, res) => {
    try {


        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({
                message: "Account not found",
                success: false,
            });
        }

        if ((user.role === Roles.superadmin) ||
            (req.user.role === Roles.admin && user.role === Roles.admin)
        ) {

            return res.status(403).json({
                message: "Action prohibited",
                success: false,
            });

        }

        let updateOptions = {};

        if (req.body.email) {

            if (validateEmail(req.body.email)) {

                updateOptions["email"] = req.body.email;

            } else {

                return res.status(422).json({
                    message: "Unsupported email",
                    success: false,
                });

            }
        }
        if (req.body.password) {

            const hashedPassword = await bcrypt.hash(req.body.password, bcryptSalt);

            updateOptions["password"] = hashedPassword;
        };

        await findByIdAndUpdate(user._id, { $set: updateOptions });

        return res.status(200).json({
            message: "Successfully updated account",
            success: true,
        });

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

//////////// Delete account /////////////
const deleteAccount = async (req, res) => {
    try {

        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({
                message: "Account not found",
                success: false,
            });
        }

        if ((req.user.role === Roles.admin && user.role === Roles.superadmin) ||
            (req.user.role === Roles.admin && user.role === Roles.admin)
        ) {
            return res.status(403).json({
                message: "Action prohibited",
                success: false,
            });
        }

        await User.findByIdAndDelete(user._id);

        return res.status(200).json({
            message: "Successfully deleted account",
            success: true,
        });

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

//////////// Get all the users /////////////
const users = async (req, res) => {
    try {

        if (req.user.role === Roles.admin || Roles.superadmin) {

            let { page, size } = req.query;

            if (!page) page = 1;
            if (!size) size = 50;

            const limit = parseInt(size);
            const skip = (page - 1) * size;

            let obj = {
                $ne: req.user.role === Roles.superadmin ? "" : Roles.superadmin
            }

            const count = await User.countDocuments({ role: obj });

            const users = await User.find({ role: obj }).sort("-createdAt").limit(limit).skip(skip);

            let allUsers = [];

            users.forEach((user) => {
                allUsers.push({
                    userId: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                });
            });

            return res.status(200).json({
                message: "Successfully fetched users",
                success: true,
                result: allUsers,
                count,
            });
        } else {
            return res.status(401).json({
                message: "Forbidden: Access is denied",
                success: false,
            });
        }

    }
    catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}

// Check whether an email is a supported email or not
const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

module.exports = {
    register,
    login,
    updateAccount,
    deleteAccount,
    users
}