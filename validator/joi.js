const Joi = require("joi");

const authSchema = Joi.object({
    firstName: Joi.string().lowercase().max(32).required(),
    lastName: Joi.string().lowercase().max(32).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp(new RegExp('^[a-zA-Z0-9]{3,30}$'))).required(),
});

module.exports = {
    authSchema,
}