import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().allow('', null).default('127.0.0.1'),
  DB_PORT: Joi.number().default(3306),
  DB_USER: Joi.string().default('root'),
  DB_PASSWORD: Joi.string().allow('', null).default(''),
  DB_NAME: Joi.string().default('ipiggconect'),
  DB_CONNECTION_LIMIT: Joi.number().default(10),
  DB_SOCKET_PATH: Joi.string().allow('', null),
  CORS_ORIGINS: Joi.string().allow('', null).default(''),
  JWT_SECRET: Joi.string().required(),
  GOOGLE_CALENDAR_ICAL_URL: Joi.string().uri().allow('', null).optional(),
  API_BASE_URL: Joi.string().uri().default('http://localhost:3000')
});
