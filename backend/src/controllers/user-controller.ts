import { OK } from "../constants/http";
import { getAllUsers } from "../services/user-service";
import catchError from "../utils/catchError";

export const userHandler = catchError(async (req, res) => {
  const users = await getAllUsers();

  return res.status(OK).json(users);
});
