import { OK } from "../constants/http";
import { getUserById } from "../services/user-service";
import catchError from "../utils/catchError";

export const getSingleUserHanlder = catchError(async (req, res) => {
  const userId = req.userId as string;
  const user = await getUserById(userId);

  return res.status(OK).json(user);
});
