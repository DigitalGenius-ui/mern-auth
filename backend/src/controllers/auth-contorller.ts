import catchError from "../utils/catchError";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import {
  emailSchema,
  loginValidSchemas,
  registerValidSchemas,
  resetPasswordValidSchemas,
} from "../Schemas/AuthSchemas";
import {
  createAccount,
  forgotPassword,
  loginUser,
  refreshUserAccessToken,
  resetPassword,
  verifyUserEmail,
} from "../services/auth-services";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAccessToken,
  setClearCookies,
} from "../utils/cookies";
import { verifyToken } from "../utils/JWTToken";
import { SessionCodeModel } from "../Model/AuthModels";
import appAssert from "../utils/AppAssert";

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
  const accessToken = req.cookies.accessToken as string | undefined;
  appAssert(accessToken, UNAUTHORIZED, "accessToken is not provided!");

  const { payload, error } = verifyToken(accessToken, "accessToken");
  appAssert(!error, UNAUTHORIZED, "Invalid access token!");

  await SessionCodeModel.destroy({ where: { id: payload?.sessionId } });

  return setClearCookies(res)
    .status(OK)
    .json({ message: "User has been loggedout successfully!" });
});

export const refreshHanlder = catchError(async (req, res) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  appAssert(refreshToken, UNAUTHORIZED, "refreshToken is not provided!");

  const { accessToken, newRefreshToken } = await refreshUserAccessToken(
    refreshToken
  );

  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
  }

  return res
    .status(OK)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .json({ message: "Access token refreshed!" });
});

export const verifyEmailHandler = catchError(async (req, res) => {
  const verifyCode = req.params.code as string | undefined;
  appAssert(verifyCode, UNAUTHORIZED, "Verify code is not provided!");

  const { user } = await verifyUserEmail(verifyCode);
  return res.status(OK).json({ message: user });
});

export const forgotPasswordHandler = catchError(async (req, res) => {
  const email = emailSchema.parse(req.body.email);
  appAssert(email, UNAUTHORIZED, "Email is not provided!");

  const { url, emailId } = await forgotPassword(email);

  return res.status(OK).json({ url, emailId });
});

export const resetPasswordHandler = catchError(async (req, res) => {
  const request = resetPasswordValidSchemas.parse(req.body);
  const { verificationCode, password } = request;

  await resetPassword({ verificationCode, password });

  return setClearCookies(res)
    .status(OK)
    .json({ message: "Password reset successfully!" });
});
