"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setClearCookies = exports.setAccessToken = exports.getRefreshTokenCookieOptions = exports.REFRESH_PATH = exports.getAccessTokenCookieOptions = void 0;
const Date_1 = require("./Date");
const env_1 = require("../constants/env");
const defaults = {
    httpOnly: true,
    secure: env_1.NODE_ENV !== "development",
    sameSite: "strict",
};
const getAccessTokenCookieOptions = () => ({
    ...defaults,
    expires: (0, Date_1.fifteenMinutesFromNow)(),
});
exports.getAccessTokenCookieOptions = getAccessTokenCookieOptions;
exports.REFRESH_PATH = "/auth/refresh";
const getRefreshTokenCookieOptions = () => ({
    ...defaults,
    expires: (0, Date_1.thirtyDaysFromNow)(),
    // we want this cookie to be available only in refresh token route.
    path: exports.REFRESH_PATH,
});
exports.getRefreshTokenCookieOptions = getRefreshTokenCookieOptions;
const setAccessToken = ({ res, accessToken, refreshToken, }) => {
    return res
        .cookie("accessToken", accessToken, (0, exports.getAccessTokenCookieOptions)())
        .cookie("refreshToken", refreshToken, (0, exports.getRefreshTokenCookieOptions)());
};
exports.setAccessToken = setAccessToken;
// clear cookies
const setClearCookies = (res) => {
    return res
        .clearCookie("accessToken")
        .clearCookie("refreshToken", { path: exports.REFRESH_PATH });
};
exports.setClearCookies = setClearCookies;
