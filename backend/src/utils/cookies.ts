import { CookieOptions, Response } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./Date";
import { NODE_ENV } from "../constants/env";

type SetAccessTokenType = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

const defaults: CookieOptions = {
  httpOnly: true,
  secure: NODE_ENV !== "development",
  sameSite: "strict",
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
});

export const REFRESH_PATH = "/auth/refresh";

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  // we want this cookie to be available only in refresh token route.
  path: REFRESH_PATH,
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
    .clearCookie("refreshToken", { path: REFRESH_PATH });
};
