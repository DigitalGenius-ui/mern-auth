import { Router } from "express";
import {
  forgotPasswordHandler,
  loginHanlder,
  logOutHanlder,
  refreshHanlder,
  registerHandler,
  resetPasswordHandler,
  verifyEmailHandler,
} from "../controllers/auth-contorller";

const authRoute = Router();

// /auth route

authRoute.post("/register", registerHandler);
authRoute.post("/login", loginHanlder);
authRoute.get("/logout", logOutHanlder);
authRoute.get("/refresh", refreshHanlder);
authRoute.get("/email/:code", verifyEmailHandler);
authRoute.post("/password/forgot", forgotPasswordHandler);
authRoute.post("/reset/password", resetPasswordHandler);

export default authRoute;
