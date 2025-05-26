import { NOT_FOUND } from "../constants/http";
import { UserModel } from "../Model/AuthModels";
import appAssert from "../utils/AppAssert";

export const getAllUsers = async () => {
  const allUsers = await UserModel.findAll();
  appAssert(allUsers.length > 0, NOT_FOUND, "No users found");
  return allUsers;
};
