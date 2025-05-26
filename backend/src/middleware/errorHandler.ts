import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import AppError from "./AppError";
import { REFRESH_PATH, setClearCookies } from "../utils/cookies";

const zodErrorHandler = (res: Response, error: z.ZodError) => {
  const errorMessage = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));
  return res.status(BAD_REQUEST).json({ errorMessage });
};

const appErrorHandler = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

const errorHandler: ErrorRequestHandler = async (error, req, res, next) => {
  if (req.path === REFRESH_PATH) {
    setClearCookies(res);
  }

  if (error instanceof z.ZodError) {
    zodErrorHandler(res, error);
    return;
  }

  if (error instanceof AppError) {
    appErrorHandler(res, error);
    return;
  }
  res.status(INTERNAL_SERVER_ERROR).send("Internal error");
};

export default errorHandler;
