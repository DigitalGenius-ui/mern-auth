"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleUserHanlder = void 0;
const http_1 = require("../constants/http");
const user_service_1 = require("../services/user-service");
const catchError_1 = __importDefault(require("../utils/catchError"));
exports.getSingleUserHanlder = (0, catchError_1.default)(async (req, res) => {
    const userId = req.userId;
    const user = await (0, user_service_1.getUserById)(userId);
    return res.status(http_1.OK).json(user);
});
