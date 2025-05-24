import { Router } from "express";
import {
  loginHanlder,
  logOutHanlder,
  registerHandler,
} from "../controllers/auth-contorller";

const authRoute = Router();

// /auth route

authRoute.post("/register", registerHandler);
authRoute.post("/login", loginHanlder);
authRoute.get("/logout", logOutHanlder);

export default authRoute;
