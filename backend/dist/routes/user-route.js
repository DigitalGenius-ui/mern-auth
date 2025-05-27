"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user-controller");
const userRoute = (0, express_1.Router)();
userRoute.get("/", user_controller_1.getSingleUserHanlder);
exports.default = userRoute;
