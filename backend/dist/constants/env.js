"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMAIL_SENDER = exports.FRONTEND_URL = exports.RESEND_API_KEY = exports.DB_HOST = exports.DB_USER = exports.DB_NAME = exports.DB_PASSWORD = exports.JWT_REFRESH_SECRET = exports.JWT_ACCESS_SECRET = exports.NODE_ENV = exports.APP_ORIGIN = exports.ENDPOINT_PORT = void 0;
exports.ENDPOINT_PORT = process.env.ENDPOINT_PORT;
exports.APP_ORIGIN = process.env.APP_ORIGIN;
exports.NODE_ENV = process.env.NODE_ENV;
// cookies variables
exports.JWT_ACCESS_SECRET = process.env.JWT_SECRET;
exports.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
// Database nariables
exports.DB_PASSWORD = process.env.DB_PASSWORD;
exports.DB_NAME = process.env.DB_NAME;
exports.DB_USER = process.env.DB_USER;
exports.DB_HOST = process.env.DB_HOST;
// resend variables
exports.RESEND_API_KEY = process.env.RESEND_API_KEY;
exports.FRONTEND_URL = process.env.FRONTEND_URL;
exports.EMAIL_SENDER = process.env.EMAIL_SENDER;
