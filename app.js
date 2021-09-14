const express = require("express");
const cors = require("cors");
const logger = require("morgan");

const userRouter = require("./routes/user.routes");

// database connection
require("./config/db")();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV !== "production") {
    app.use(logger("dev"));
}

// routing config
app.use("/api/users", userRouter);

// 404 handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

// global error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        success: false,
    });
});

module.exports = app;