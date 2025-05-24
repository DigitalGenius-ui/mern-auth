import { z } from "zod";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../constants/env";
import { CONFLICT, UNAUTHORIZED } from "../constants/http";
import VerificationCodeType from "../constants/VerificationCode";
import appAssert from "../utils/AppAssert";
import { checkPasswords, encryptPassword } from "../utils/BcryptJS";
import { oneYearFromNow } from "../utils/Date";
import jwt from "jsonwebtoken";
import {
  loginValidSchemas,
  registerValidSchemas,
} from "../Schemas/AuthSchemas";
import {
  SessionCodeModel,
  UserModel,
  VerificationCodeModel,
} from "../Model/AuthModels";
import { generateToken } from "../utils/JWTToken";

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

  // create session
  const session = await SessionCodeModel.create({
    userId: user.dataValues.id,
    userAgent: request.userAgent,
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
  appAssert(userExists, UNAUTHORIZED, "User is not exists!");

  const { id: userId, password } = userExists?.dataValues;

  // valid password of the user
  const isPasswordValid = await checkPasswords(request.password, password);
  appAssert(isPasswordValid, UNAUTHORIZED, "Passwords are not matching!");

  // create session
  const session = await SessionCodeModel.create({
    userId: userId,
    userAgent: request.userAgent,
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
