const jwt = require("jsonwebtoken");
const ENV = require("../config/env");
const User = require("../models/user.model");
const { superadmin } = require("../utils/roles");

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, ENV.JWT_SECRET);

            req.user = await User.findById(decoded._id);

            next();

        } catch (err) {
            return res.status(401).json({
                message: "Unauthorized access",
                success: false,
            });
        }
    } else {
        return res.status(401).json({
            message: "Authorization token missing",
            success: false,
        });
    }
};

const isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === superadmin) {
        next();
    } else {
        return res.status(401).json({
            message: "Forbidden: Access is denied",
            success: false,
        });
    }
};

module.exports = {
    protect,
    isSuperAdmin
}


