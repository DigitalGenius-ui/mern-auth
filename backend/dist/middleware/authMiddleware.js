"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const AppAssert_1 = __importDefault(require("../utils/AppAssert"));
const http_1 = require("../constants/http");
const AppErrorCode_1 = require("../constants/AppErrorCode");
const JWTToken_1 = require("../utils/JWTToken");
const authMiddleware = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    (0, AppAssert_1.default)(accessToken, http_1.NOT_FOUND, "Access token is not found", AppErrorCode_1.AppErrorCode.TOKEN_NOT_FOUND);
    // TODO: must fix the verifyToken erro if the token is invalid
    const { payload, error } = (0, JWTToken_1.verifyToken)(accessToken, "accessToken");
    (0, AppAssert_1.default)(!error, http_1.NOT_FOUND, "Access token is invalid!", AppErrorCode_1.AppErrorCode.INVALID_TOKEN);
    req.userId = payload?.user_id;
    req.sessionId = payload?.sessionId;
    next();
};
exports.authMiddleware = authMiddleware;
