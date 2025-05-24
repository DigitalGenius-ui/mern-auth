import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../constants/env";
import { DataTypes } from "sequelize";

type accessType = {
  user_id: typeof DataTypes.UUID;
  sessionId: typeof DataTypes.UUID;
};

type refreshType = {
  sessionId: typeof DataTypes.UUID;
};

type Params = {
  payload: accessType | refreshType;
  type: "refreshToken" | "accessToken";
};

const options = {
  // this is for knowing the user's roll
  audience: ["user"],
};

// generate new token
export const generateToken = ({ payload, type }: Params) => {
  const refreshToken = type === "refreshToken";
  const secret = refreshToken ? JWT_REFRESH_SECRET : JWT_ACCESS_SECRET;

  return jwt.sign(payload, secret, {
    ...options,
    expiresIn: refreshToken ? "30d" : "15m",
  });
};

// verify token
export const verifyToken = <TOptions extends accessType>(token: string) => {
  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET, {
      ...options,
    }) as TOptions;
    return payload;
  } catch (error: any) {
    console.log(error);
    return {
      error: error.errors[0].message,
    };
  }
};
