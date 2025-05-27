"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.verifyUserEmail = exports.refreshUserAccessToken = exports.loginUser = exports.createAccount = void 0;
const http_1 = require("../constants/http");
const AppAssert_1 = __importDefault(require("../utils/AppAssert"));
const BcryptJS_1 = require("../utils/BcryptJS");
const Date_1 = require("../utils/Date");
const AuthModels_1 = require("../Model/AuthModels");
const JWTToken_1 = require("../utils/JWTToken");
const sequelize_1 = require("sequelize");
const sendEmail_1 = require("../utils/sendEmail");
const env_1 = require("../constants/env");
const emailTemplate_1 = require("../utils/emailTemplate");
const createAccount = async (request) => {
    const userExist = await AuthModels_1.UserModel.findOne({
        where: { email: request.email },
    });
    (0, AppAssert_1.default)(!userExist, http_1.CONFLICT, "Email is already in use!");
    // create new user
    const { password, confirmPassword, ...rest } = request;
    const newPassword = await (0, BcryptJS_1.encryptPassword)(password);
    const user = await AuthModels_1.UserModel.create({
        password: newPassword,
        ...rest,
    });
    const { password: createdPassword, ...userData } = user.dataValues;
    // create verification code
    const verificationCode = await AuthModels_1.VerificationCodeModel.create({
        userId: user.dataValues.id,
        type: "email_verification" /* VerificationCodeType.EmailVerification */,
        expiresAt: (0, Date_1.oneYearFromNow)(),
    });
    // send verfity email
    const url = `${env_1.FRONTEND_URL}/email/verify/${verificationCode.dataValues.id}`;
    const { error } = await (0, sendEmail_1.sendEmail)({
        to: user.dataValues.email,
        ...(0, emailTemplate_1.getVerifyEmailTemplate)(url),
    });
    if (error) {
        console.log(error);
    }
    // create session
    const session = await AuthModels_1.SessionCodeModel.create({
        userId: user.dataValues.id,
        userAgent: request.userAgent,
        expiresAt: (0, Date_1.thirtyDaysFromNow)(),
    });
    // create refresh token
    const refreshToken = (0, JWTToken_1.generateToken)({
        payload: { sessionId: session.dataValues.id },
        type: "refreshToken",
    });
    // create access token
    const accessToken = (0, JWTToken_1.generateToken)({
        payload: { user_id: user.dataValues.id, sessionId: session.dataValues.id },
        type: "accessToken",
    });
    return {
        accessToken,
        refreshToken,
        user: userData,
    };
};
exports.createAccount = createAccount;
const loginUser = async (request) => {
    // get user by email
    const userExists = await AuthModels_1.UserModel.findOne({
        where: { email: request.email },
    });
    // valid user is exist
    (0, AppAssert_1.default)(userExists, http_1.NOT_FOUND, "User is not exists!");
    const { id: userId, password } = userExists?.dataValues;
    // valid password of the user
    const isPasswordValid = await (0, BcryptJS_1.checkPasswords)(request.password, password);
    (0, AppAssert_1.default)(isPasswordValid, http_1.CONFLICT, "Invalid email or password!");
    // create session
    const session = await AuthModels_1.SessionCodeModel.create({
        userId: userId,
        userAgent: request.userAgent,
        expiresAt: (0, Date_1.thirtyDaysFromNow)(),
    });
    // create refresh token
    const refreshToken = (0, JWTToken_1.generateToken)({
        payload: { sessionId: session.dataValues.id },
        type: "refreshToken",
    });
    // create access token
    const accessToken = (0, JWTToken_1.generateToken)({
        payload: {
            user_id: userExists.dataValues.id,
            sessionId: session.dataValues.id,
        },
        type: "accessToken",
    });
    // return user and tokens
    const { password: createdPassword, ...userData } = userExists?.dataValues;
    return {
        accessToken,
        refreshToken,
        user: userData,
    };
};
exports.loginUser = loginUser;
const refreshUserAccessToken = async (refreshToken) => {
    const { payload, error } = (0, JWTToken_1.verifyToken)(refreshToken, "refreshToken");
    (0, AppAssert_1.default)(!error, http_1.UNAUTHORIZED, "Invalid refreshToken!");
    const session = await AuthModels_1.SessionCodeModel.findOne({
        where: { id: payload?.sessionId },
    });
    const sessionExpireAt = session?.dataValues.expiresAt;
    const now = Date.now();
    (0, AppAssert_1.default)(session && sessionExpireAt.getTime() > now, http_1.UNAUTHORIZED, "Session is expired!");
    // refresh the session if it expires in 24 hours
    const isSessionExpiringSoon = sessionExpireAt.getTime() - now <= (0, Date_1.ON_DAY_MS)();
    if (isSessionExpiringSoon) {
        await session.update({
            expiresAt: (0, Date_1.thirtyDaysFromNow)(),
        });
    }
    // regenrate refresh and accesstokens
    const newRefreshToken = isSessionExpiringSoon
        ? (0, JWTToken_1.generateToken)({
            payload: { sessionId: session.dataValues.id },
            type: "refreshToken",
        })
        : undefined;
    const accessToken = (0, JWTToken_1.generateToken)({
        payload: {
            user_id: session.dataValues.userId,
            sessionId: session.dataValues.id,
        },
        type: "accessToken",
    });
    return {
        accessToken,
        newRefreshToken,
    };
};
exports.refreshUserAccessToken = refreshUserAccessToken;
const verifyUserEmail = async (verificationCode) => {
    // get verification code
    const getCode = await AuthModels_1.VerificationCodeModel.findOne({
        where: { id: verificationCode },
    });
    (0, AppAssert_1.default)(getCode, http_1.UNAUTHORIZED, "Verification code is not valid!");
    // get user by id
    const user = await AuthModels_1.UserModel.findOne({
        where: { id: getCode.dataValues.userId },
    });
    (0, AppAssert_1.default)(user, http_1.UNAUTHORIZED, "User is not exists!");
    // updater user verified to true
    const updateUser = await user.update({ verified: true });
    (0, AppAssert_1.default)(updateUser, http_1.INTERNAL_SERVER_ERROR, "Failed to verify user!");
    // delete verification code
    await AuthModels_1.VerificationCodeModel.destroy({ where: { id: verificationCode } });
    // return user data
    const { password, ...userData } = user.dataValues;
    return { user: userData };
};
exports.verifyUserEmail = verifyUserEmail;
const forgotPassword = async (email) => {
    const user = await AuthModels_1.UserModel.findOne({
        where: { email },
    });
    (0, AppAssert_1.default)(user, http_1.NOT_FOUND, "User is not exists!");
    // check email rate limit
    const requestCount = await AuthModels_1.VerificationCodeModel.count({
        where: {
            userId: user.dataValues.id,
            type: "password_reset" /* VerificationCodeType.PasswordReset */,
            createdAt: {
                [sequelize_1.Op.gte]: (0, Date_1.fiveMinutesAgo)(),
            },
        },
    });
    (0, AppAssert_1.default)(requestCount <= 1, http_1.TOO_MANY_REQUESTS, "Too many requests! Please try again later.");
    // create verification code for password reset
    const expiresAt = (0, Date_1.oneHoureFromNow)();
    const verificationCode = await AuthModels_1.VerificationCodeModel.create({
        userId: user.dataValues.id,
        type: "password_reset" /* VerificationCodeType.PasswordReset */,
        expiresAt,
    });
    // send email with verification code
    const url = `${env_1.FRONTEND_URL}/password/reset?code=${verificationCode.dataValues.id}&exp=${expiresAt.getTime()}`;
    const { data, error } = await (0, sendEmail_1.sendEmail)({
        to: user.dataValues.email,
        ...(0, emailTemplate_1.getPasswordResetTemplate)(url),
    });
    (0, AppAssert_1.default)(data?.id, http_1.INTERNAL_SERVER_ERROR, `${error?.name} - ${error?.message}`);
    // return success message
    return {
        url,
        emailId: data?.id,
    };
};
exports.forgotPassword = forgotPassword;
const resetPassword = async ({ verificationCode, password, }) => {
    // get verification code
    const code = await AuthModels_1.VerificationCodeModel.findOne({
        where: { id: verificationCode },
    });
    (0, AppAssert_1.default)(code, http_1.CONFLICT, "Verification code is not valid!");
    // change the password
    const user = await AuthModels_1.UserModel.findOne({
        where: { id: code.dataValues.userId },
    });
    (0, AppAssert_1.default)(user, http_1.NOT_FOUND, "User is not exists!");
    const updatePassword = await user.update({
        password: await (0, BcryptJS_1.encryptPassword)(password),
    });
    (0, AppAssert_1.default)(updatePassword, http_1.INTERNAL_SERVER_ERROR, "Failed to update password!");
    // delete the verification code
    await AuthModels_1.VerificationCodeModel.destroy({ where: { id: verificationCode } });
    // delete all sessions
    await AuthModels_1.SessionCodeModel.destroy({ where: { userId: user.dataValues.id } });
    // return success message
    return {
        message: "Password has been reset successfully! Please login again.",
    };
};
exports.resetPassword = resetPassword;
