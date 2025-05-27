"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const env_1 = require("./constants/env");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const auth_route_1 = __importDefault(require("./routes/auth-route"));
const user_route_1 = __importDefault(require("./routes/user-route"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const session_route_1 = __importDefault(require("./routes/session-route"));
const app = (0, express_1.default)();
// middlewares
app.use(express_1.default.json());
// to pass form data
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({ origin: env_1.APP_ORIGIN, credentials: true }));
app.use((0, cookie_parser_1.default)());
// app routes
app.use("/auth", auth_route_1.default);
//protected routes
app.use("/user", authMiddleware_1.authMiddleware, user_route_1.default);
app.use("/session", authMiddleware_1.authMiddleware, session_route_1.default);
// error handler
app.use(errorHandler_1.default);
app.listen(env_1.ENDPOINT_PORT, () => {
    console.log(`Server is running in port ${env_1.ENDPOINT_PORT}`);
});
