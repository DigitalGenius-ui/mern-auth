"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = void 0;
const http_1 = require("../constants/http");
const AuthModels_1 = require("../Model/AuthModels");
const AppAssert_1 = __importDefault(require("../utils/AppAssert"));
const getUserById = async (userId) => {
    const user = await AuthModels_1.UserModel.findOne({ where: { id: userId } });
    (0, AppAssert_1.default)(user, http_1.NOT_FOUND, "User not found");
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
};
exports.getUserById = getUserById;
