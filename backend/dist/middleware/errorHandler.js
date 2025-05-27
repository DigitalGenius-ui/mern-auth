"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("../constants/http");
const zod_1 = require("zod");
const AppError_1 = __importDefault(require("./AppError"));
const cookies_1 = require("../utils/cookies");
const zodErrorHandler = (res, error) => {
    const errorMessage = error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
    }));
    return res.status(http_1.BAD_REQUEST).json({ errorMessage });
};
const appErrorHandler = (res, error) => {
    return res.status(error.statusCode).json({
        message: error.message,
        errorCode: error.errorCode,
    });
};
const errorHandler = async (error, req, res, next) => {
    if (req.path === cookies_1.REFRESH_PATH) {
        (0, cookies_1.setClearCookies)(res);
    }
    if (error instanceof zod_1.z.ZodError) {
        zodErrorHandler(res, error);
        return;
    }
    if (error instanceof AppError_1.default) {
        appErrorHandler(res, error);
        return;
    }
    res.status(http_1.INTERNAL_SERVER_ERROR).send("Internal error");
};
exports.default = errorHandler;
