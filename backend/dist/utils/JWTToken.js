"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../constants/env");
const options = {
    // this is for knowing the user's roll
    audience: ["user"],
};
// generate new token
const generateToken = ({ payload, type }) => {
    const refreshToken = type === "refreshToken";
    const secret = refreshToken ? env_1.JWT_REFRESH_SECRET : env_1.JWT_ACCESS_SECRET;
    return jsonwebtoken_1.default.sign(payload, secret, {
        ...options,
        expiresIn: refreshToken ? "30d" : "15m",
    });
};
exports.generateToken = generateToken;
const verifyToken = (token, type) => {
    const secret = type === "accessToken" ? env_1.JWT_ACCESS_SECRET : env_1.JWT_REFRESH_SECRET;
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret, {
            ...options,
        });
        return { payload };
    }
    catch (error) {
        return {
            error: error.message || "Token verification failed",
        };
    }
};
exports.verifyToken = verifyToken;
