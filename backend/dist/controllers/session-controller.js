"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSessionHandler = exports.getSessionHandler = void 0;
const zod_1 = require("zod");
const http_1 = require("../constants/http");
const AppAssert_1 = __importDefault(require("../utils/AppAssert"));
const catchError_1 = __importDefault(require("../utils/catchError"));
const sequelize_1 = require("sequelize");
const AuthModels_1 = require("../Model/AuthModels");
exports.getSessionHandler = (0, catchError_1.default)(async (req, res) => {
    const userId = req.userId;
    (0, AppAssert_1.default)(userId, http_1.NOT_FOUND, "Session is not exist!");
    const session = await AuthModels_1.SessionCodeModel.findAll({
        where: { userId, expiresAt: { [sequelize_1.Op.gt]: new Date() } },
        attributes: ["id", "userAgent", "createdAt"],
        order: [["createdAt", "DESC"]],
    });
    (0, AppAssert_1.default)(session, http_1.NOT_FOUND, "Session not found");
    // the user should delete the session which is the current session.
    const currentSession = session.map((s) => ({
        ...s.toJSON(),
        ...(s.dataValues.id === req.sessionId && { isCurrent: true }),
    }));
    return res.status(http_1.OK).json(currentSession);
});
exports.deleteSessionHandler = (0, catchError_1.default)(async (req, res) => {
    const sessionId = zod_1.z.string().parse(req.params.id);
    const userId = req.userId;
    (0, AppAssert_1.default)(sessionId, http_1.NOT_FOUND, "Session ID is required!");
    const session = await AuthModels_1.SessionCodeModel.destroy({
        where: { id: sessionId, userId },
    });
    (0, AppAssert_1.default)(session, http_1.NOT_FOUND, "Session not found!");
    return res.status(http_1.OK).json({ message: "Session deleted successfully!" });
});
