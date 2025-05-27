"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_contorller_1 = require("../controllers/auth-contorller");
const authRoute = (0, express_1.Router)();
// /auth route
authRoute.post("/register", auth_contorller_1.registerHandler);
authRoute.post("/login", auth_contorller_1.loginHanlder);
authRoute.get("/logout", auth_contorller_1.logOutHanlder);
authRoute.get("/refresh", auth_contorller_1.refreshHanlder);
authRoute.get("/email/:code", auth_contorller_1.verifyEmailHandler);
authRoute.post("/password/forgot", auth_contorller_1.forgotPasswordHandler);
authRoute.post("/reset/password", auth_contorller_1.resetPasswordHandler);
exports.default = authRoute;
