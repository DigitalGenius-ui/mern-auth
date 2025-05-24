import { CookieOptions, Response } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./Date";

type SetAccessTokenType = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

const defaults: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  sameSite: "strict",
};

const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
});

const refreshTokenPath = "/auth/refreshToken";

const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  // we want this cookie to be available only in refresh token route.
  path: refreshTokenPath,
});

export const setAccessToken = ({
  res,
  accessToken,
  refreshToken,
}: SetAccessTokenType) => {
  return res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};

// clear cookies
export const setClearCookies = (res: Response) => {
  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken", { path: refreshTokenPath });
};
