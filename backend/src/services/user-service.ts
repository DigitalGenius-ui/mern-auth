import { NOT_FOUND } from "../constants/http";
import { UserModel } from "../Model/AuthModels";
import appAssert from "../utils/AppAssert";

export const getUserById = async (userId: string) => {
  const user = await UserModel.findOne({ where: { id: userId } });
  appAssert(user, NOT_FOUND, "User not found");

  const { password, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};
