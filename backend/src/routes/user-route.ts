import { Router } from "express";
import { userHandler } from "../controllers/user-controller";

const userRoute = Router();

userRoute.get("/", userHandler);

export default userRoute;
