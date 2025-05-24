import assert from "node:assert";
import AppError from "../middleware/AppError";
import { HttpStatusCode } from "../constants/http";
import { AppErrorCode } from "../constants/AppErrorCode";

type AppAssertType = (
  condition: any,
  httpStatusCode: HttpStatusCode,
  message: string,
  appErrorCode?: AppErrorCode
) => asserts condition;

const appAssert: AppAssertType = (
  condition,
  httpStatusCode,
  message,
  appErrorCode
) => assert(condition, new AppError(httpStatusCode, message, appErrorCode));

export default appAssert;
