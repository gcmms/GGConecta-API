"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationSchema = void 0;
const Joi = require("joi");
exports.envValidationSchema = Joi.object({
    PORT: Joi.number().default(3000),
    DB_HOST: Joi.string().allow('', null).default('127.0.0.1'),
    DB_PORT: Joi.number().default(3306),
    DB_USER: Joi.string().default('root'),
    DB_PASSWORD: Joi.string().allow('', null).default(''),
    DB_NAME: Joi.string().default('ipiggconect'),
    DB_CONNECTION_LIMIT: Joi.number().default(10),
    DB_SOCKET_PATH: Joi.string().allow('', null),
    JWT_SECRET: Joi.string().required(),
    GOOGLE_CALENDAR_ICAL_URL: Joi.string().uri().required(),
    API_BASE_URL: Joi.string().uri().default('http://localhost:3000')
});
//# sourceMappingURL=env.validation.js.map