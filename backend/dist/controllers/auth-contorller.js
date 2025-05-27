"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordHandler = exports.forgotPasswordHandler = exports.verifyEmailHandler = exports.refreshHanlder = exports.logOutHanlder = exports.loginHanlder = exports.registerHandler = void 0;
const catchError_1 = __importDefault(require("../utils/catchError"));
const http_1 = require("../constants/http");
const AuthSchemas_1 = require("../Schemas/AuthSchemas");
const auth_services_1 = require("../services/auth-services");
const cookies_1 = require("../utils/cookies");
const JWTToken_1 = require("../utils/JWTToken");
const AuthModels_1 = require("../Model/AuthModels");
const AppAssert_1 = __importDefault(require("../utils/AppAssert"));
exports.registerHandler = (0, catchError_1.default)(async (req, res) => {
    const request = AuthSchemas_1.registerValidSchemas.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });
    const { user, accessToken, refreshToken } = await (0, auth_services_1.createAccount)(request);
    return (0, cookies_1.setAccessToken)({ res, accessToken, refreshToken })
        .status(http_1.CREATED)
        .json({ message: user });
});
exports.loginHanlder = (0, catchError_1.default)(async (req, res) => {
    const request = AuthSchemas_1.loginValidSchemas.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });
    const { accessToken, refreshToken, user } = await (0, auth_services_1.loginUser)(request);
    return (0, cookies_1.setAccessToken)({ res, accessToken, refreshToken })
        .status(http_1.OK)
        .json({ message: "Login successfull." });
});
exports.logOutHanlder = (0, catchError_1.default)(async (req, res) => {
    const accessToken = req.cookies.accessToken;
    (0, AppAssert_1.default)(accessToken, http_1.UNAUTHORIZED, "accessToken is not provided!");
    const { payload, error } = (0, JWTToken_1.verifyToken)(accessToken, "accessToken");
    (0, AppAssert_1.default)(!error, http_1.UNAUTHORIZED, "Invalid access token!");
    await AuthModels_1.SessionCodeModel.destroy({ where: { id: payload?.sessionId } });
    return (0, cookies_1.setClearCookies)(res)
        .status(http_1.OK)
        .json({ message: "User has been loggedout successfully!" });
});
exports.refreshHanlder = (0, catchError_1.default)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    (0, AppAssert_1.default)(refreshToken, http_1.UNAUTHORIZED, "refreshToken is not provided!");
    const { accessToken, newRefreshToken } = await (0, auth_services_1.refreshUserAccessToken)(refreshToken);
    if (newRefreshToken) {
        res.cookie("refreshToken", newRefreshToken, (0, cookies_1.getRefreshTokenCookieOptions)());
    }
    return res
        .status(http_1.OK)
        .cookie("accessToken", accessToken, (0, cookies_1.getAccessTokenCookieOptions)())
        .json({ message: "Access token refreshed!" });
});
exports.verifyEmailHandler = (0, catchError_1.default)(async (req, res) => {
    const verifyCode = req.params.code;
    (0, AppAssert_1.default)(verifyCode, http_1.UNAUTHORIZED, "Verify code is not provided!");
    const { user } = await (0, auth_services_1.verifyUserEmail)(verifyCode);
    return res.status(http_1.OK).json({ message: user });
});
exports.forgotPasswordHandler = (0, catchError_1.default)(async (req, res) => {
    const email = AuthSchemas_1.emailSchema.parse(req.body.email);
    (0, AppAssert_1.default)(email, http_1.UNAUTHORIZED, "Email is not provided!");
    const { url, emailId } = await (0, auth_services_1.forgotPassword)(email);
    return res.status(http_1.OK).json({ url, emailId });
});
exports.resetPasswordHandler = (0, catchError_1.default)(async (req, res) => {
    const request = AuthSchemas_1.resetPasswordValidSchemas.parse(req.body);
    const { verificationCode, password } = request;
    await (0, auth_services_1.resetPassword)({ verificationCode, password });
    return (0, cookies_1.setClearCookies)(res)
        .status(http_1.OK)
        .json({ message: "Password reset successfully!" });
});
