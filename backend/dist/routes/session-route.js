"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const session_controller_1 = require("../controllers/session-controller");
const sessionRoute = (0, express_1.Router)();
sessionRoute.get("/", session_controller_1.getSessionHandler);
sessionRoute.delete("/:id", session_controller_1.deleteSessionHandler);
exports.default = sessionRoute;
