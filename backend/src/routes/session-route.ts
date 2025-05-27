import { Router } from "express";
import {
  deleteSessionHandler,
  getSessionHandler,
} from "../controllers/session-controller";

const sessionRoute = Router();

sessionRoute.get("/", getSessionHandler);
sessionRoute.delete("/:id", deleteSessionHandler);

export default sessionRoute;
