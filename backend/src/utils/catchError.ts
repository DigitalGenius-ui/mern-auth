import { NextFunction, Request, Response } from "express";

type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const catchError =
  (contorller: ControllerType): ControllerType =>
  async (req, res, next) => {
    try {
      await contorller(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export default catchError;
