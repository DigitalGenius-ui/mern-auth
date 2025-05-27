"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSession = exports.getSession = void 0;
const sequelize_1 = require("sequelize");
const http_1 = require("../constants/http");
const AuthModels_1 = require("../Model/AuthModels");
const AppAssert_1 = __importDefault(require("../utils/AppAssert"));
const getSession = async (userId) => {
    const session = await AuthModels_1.SessionCodeModel.findAll({
        where: { userId, expiresAt: { [sequelize_1.Op.gt]: new Date() } },
        attributes: ["id", "userAgent", "createdAt"],
        order: [["createdAt", "DESC"]],
    });
    (0, AppAssert_1.default)(session, http_1.NOT_FOUND, "Session not found");
    return { session };
};
exports.getSession = getSession;
const deleteSession = async (sessionId) => {
    const session = await AuthModels_1.SessionCodeModel.destroy({
        where: { id: sessionId },
    });
    (0, AppAssert_1.default)(session, http_1.NOT_FOUND, "Session not found");
    return { session };
};
exports.deleteSession = deleteSession;
