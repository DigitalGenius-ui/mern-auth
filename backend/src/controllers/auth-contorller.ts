import catchError from "../utils/catchError";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import {
  loginValidSchemas,
  registerValidSchemas,
} from "../Schemas/AuthSchemas";
import { createAccount, loginUser } from "../services/auth-services";
import { setAccessToken, setClearCookies } from "../utils/cookies";
import { verifyToken } from "../utils/JWTToken";
import { SessionCodeModel } from "../Model/AuthModels";
import appAssert from "../utils/AppAssert";
import { JWT_ACCESS_SECRET } from "../constants/env";

export const registerHandler = catchError(async (req, res) => {
  const request = registerValidSchemas.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { user, accessToken, refreshToken } = await createAccount(request);

  return setAccessToken({ res, accessToken, refreshToken })
    .status(CREATED)
    .json({ message: user });
});

export const loginHanlder = catchError(async (req, res) => {
  const request = loginValidSchemas.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { accessToken, refreshToken, user } = await loginUser(request);
  return setAccessToken({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: "Login successfull." });
});

export const logOutHanlder = catchError(async (req, res) => {
  const accessToken = req.cookies.accessToken;
  appAssert(accessToken, UNAUTHORIZED, "Token is not provided!");

  const decoded = verifyToken(accessToken);
  appAssert(
    !("error" in decoded),
    UNAUTHORIZED,
    "Something went wrong with decoded!"
  );

  await SessionCodeModel.destroy({ where: { id: decoded.sessionId } });

  return setClearCookies(res)
    .status(OK)
    .json({ message: "User has been loggedout successfully!" });
});
