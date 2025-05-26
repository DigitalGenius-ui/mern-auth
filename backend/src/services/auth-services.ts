import { z } from "zod";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "../constants/http";
import VerificationCodeType from "../constants/VerificationCode";
import appAssert from "../utils/AppAssert";
import { checkPasswords, encryptPassword } from "../utils/BcryptJS";
import {
  fiveMinutesAgo,
  ON_DAY_MS,
  oneHoureFromNow,
  oneYearFromNow,
  thirtyDaysFromNow,
} from "../utils/Date";
import {
  verificationCodeSchema,
  loginValidSchemas,
  registerValidSchemas,
  resetPasswordValidSchemas,
} from "../Schemas/AuthSchemas";
import {
  SessionCodeModel,
  UserModel,
  VerificationCodeModel,
} from "../Model/AuthModels";
import { generateToken, verifyToken } from "../utils/JWTToken";
import { Op } from "sequelize";
import { sendEmail } from "../utils/sendEmail";
import { FRONTEND_URL } from "../constants/env";
import {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} from "../utils/emailTemplate";

type regRequestType = z.infer<typeof registerValidSchemas>;

export const createAccount = async (request: regRequestType) => {
  const userExist = await UserModel.findOne({
    where: { email: request.email },
  });

  appAssert(!userExist, CONFLICT, "Email is already in use!");

  // create new user
  const { password, confirmPassword, ...rest } = request;
  const newPassword = await encryptPassword(password);

  const user = await UserModel.create({
    password: newPassword,
    ...rest,
  });

  const { password: createdPassword, ...userData } = user.dataValues;

  // create verification code
  const verificationCode = await VerificationCodeModel.create({
    userId: user.dataValues.id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  // send verfity email
  const url = `${FRONTEND_URL}/email/verify/${verificationCode.dataValues.id}`;
  const { error } = await sendEmail({
    to: user.dataValues.email,
    ...getVerifyEmailTemplate(url),
  });

  if (error) {
    console.log(error);
  }

  // create session
  const session = await SessionCodeModel.create({
    userId: user.dataValues.id,
    userAgent: request.userAgent,
    expiresAt: thirtyDaysFromNow(),
  });

  // create refresh token
  const refreshToken = generateToken({
    payload: { sessionId: session.dataValues.id },
    type: "refreshToken",
  });

  // create access token
  const accessToken = generateToken({
    payload: { user_id: user.dataValues.id, sessionId: session.dataValues.id },
    type: "accessToken",
  });

  return {
    accessToken,
    refreshToken,
    user: userData,
  };
};

type logRequestType = z.infer<typeof loginValidSchemas>;

export const loginUser = async (request: logRequestType) => {
  // get user by email
  const userExists = await UserModel.findOne({
    where: { email: request.email },
  });
  // valid user is exist
  appAssert(userExists, NOT_FOUND, "User is not exists!");

  const { id: userId, password } = userExists?.dataValues;

  // valid password of the user
  const isPasswordValid = await checkPasswords(request.password, password);
  appAssert(isPasswordValid, CONFLICT, "Invalid email or password!");

  // create session
  const session = await SessionCodeModel.create({
    userId: userId,
    userAgent: request.userAgent,
    expiresAt: thirtyDaysFromNow(),
  });

  // create refresh token
  const refreshToken = generateToken({
    payload: { sessionId: session.dataValues.id },
    type: "refreshToken",
  });

  // create access token
  const accessToken = generateToken({
    payload: {
      user_id: userExists.dataValues.id,
      sessionId: session.dataValues.id,
    },
    type: "accessToken",
  });

  // return user and tokens
  const { password: createdPassword, ...userData } = userExists?.dataValues;
  return {
    accessToken,
    refreshToken,
    user: userData,
  };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  const payload = verifyToken(refreshToken, "refreshToken");
  appAssert(!("error" in payload), UNAUTHORIZED, "Invalid refreshToken!");

  const session = await SessionCodeModel.findOne({
    where: { id: payload.sessionId },
  });

  const sessionExpireAt = session?.dataValues.expiresAt;
  const now = Date.now();

  appAssert(
    session && sessionExpireAt.getTime() > now,
    UNAUTHORIZED,
    "Session is expired!"
  );

  // refresh the session if it expires in 24 hours
  const isSessionExpiringSoon = sessionExpireAt.getTime() - now <= ON_DAY_MS();
  if (isSessionExpiringSoon) {
    await session.update({
      expiresAt: thirtyDaysFromNow(),
    });
  }

  // regenrate refresh and accesstokens

  const newRefreshToken = isSessionExpiringSoon
    ? generateToken({
        payload: { sessionId: session.dataValues.id },
        type: "refreshToken",
      })
    : undefined;

  const accessToken = generateToken({
    payload: {
      user_id: session.dataValues.userId,
      sessionId: session.dataValues.id,
    },
    type: "accessToken",
  });

  return {
    accessToken,
    newRefreshToken,
  };
};

export const verifyUserEmail = async (
  verificationCode: z.infer<typeof verificationCodeSchema>
) => {
  // get verification code
  const getCode = await VerificationCodeModel.findOne({
    where: { id: verificationCode },
  });
  appAssert(getCode, UNAUTHORIZED, "Verification code is not valid!");
  // get user by id
  const user = await UserModel.findOne({
    where: { id: getCode.dataValues.userId },
  });
  appAssert(user, UNAUTHORIZED, "User is not exists!");
  // updater user verified to true
  const updateUser = await user.update({ verified: true });
  appAssert(updateUser, INTERNAL_SERVER_ERROR, "Failed to verify user!");
  // delete verification code
  await VerificationCodeModel.destroy({ where: { id: verificationCode } });
  // return user data
  const { password, ...userData } = user.dataValues;
  return { user: userData };
};

export const forgotPassword = async (email: string) => {
  const user = await UserModel.findOne({
    where: { email },
  });

  appAssert(user, NOT_FOUND, "User is not exists!");

  // check email rate limit
  const requestCount = await VerificationCodeModel.count({
    where: {
      userId: user.dataValues.id,
      type: VerificationCodeType.PasswordReset,
      createdAt: {
        [Op.gte]: fiveMinutesAgo(),
      },
    },
  });

  appAssert(
    requestCount <= 1,
    TOO_MANY_REQUESTS,
    "Too many requests! Please try again later."
  );

  // create verification code for password reset
  const expiresAt = oneHoureFromNow();
  const verificationCode = await VerificationCodeModel.create({
    userId: user.dataValues.id,
    type: VerificationCodeType.PasswordReset,
    expiresAt,
  });

  // send email with verification code
  const url = `${FRONTEND_URL}/password/reset?code=${
    verificationCode.dataValues.id
  }&exp=${expiresAt.getTime()}`;

  const { data, error } = await sendEmail({
    to: user.dataValues.email,
    ...getPasswordResetTemplate(url),
  });

  appAssert(
    data?.id,
    INTERNAL_SERVER_ERROR,
    `${error?.name} - ${error?.message}`
  );

  // return success message
  return {
    url,
    emailId: data?.id,
  };
};

type resetPasswordRequestType = z.infer<typeof resetPasswordValidSchemas>;
export const resetPassword = async ({
  verificationCode,
  password,
}: resetPasswordRequestType) => {
  // get verification code
  const code = await VerificationCodeModel.findOne({
    where: { id: verificationCode },
  });
  appAssert(code, CONFLICT, "Verification code is not valid!");
  // change the password
  const user = await UserModel.findOne({
    where: { id: code.dataValues.userId },
  });
  appAssert(user, NOT_FOUND, "User is not exists!");

  const updatePassword = await user.update({
    password: await encryptPassword(password),
  });
  appAssert(
    updatePassword,
    INTERNAL_SERVER_ERROR,
    "Failed to update password!"
  );
  // delete the verification code
  await VerificationCodeModel.destroy({ where: { id: verificationCode } });
  // delete all sessions
  await SessionCodeModel.destroy({ where: { userId: user.dataValues.id } });
  // return success message
  return {
    message: "Password has been reset successfully! Please login again.",
  };
};
