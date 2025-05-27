import { Router } from "express";
import { getSingleUserHanlder } from "../controllers/user-controller";

const userRoute = Router();

userRoute.get("/", getSingleUserHanlder);

export default userRoute;
