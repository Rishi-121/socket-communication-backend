const express = require("express");
const Roles = require("../utils/roles");

const options = {
    strict: true,
    mergeParams: false,
    caseSensitive: false,
};

const router = express.Router(options);
const {
    register,
    login,
    updateAccount,
    deleteAccount,
    users
} = require("../controllers/user.controller");
const { protect, isSuperAdmin } = require("../middleware/auth.middleware");

router.post("/register", async (req, res) => {
    await register(req, res);
});

router.post("/register-admin", protect, isSuperAdmin,
    async (req, res) => {
        await register(req, res, Roles.admin);
    }
);

router.post("/login", login);

router.patch("/update/:userId", protect, updateAccount);

router.delete("/delete/:userId", protect, deleteAccount);

router.get("/", protect, users);

module.exports = router;
