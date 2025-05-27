import { z } from "zod";
import { NOT_FOUND, OK } from "../constants/http";
import appAssert from "../utils/AppAssert";
import catchError from "../utils/catchError";
import { Op } from "sequelize";
import { SessionCodeModel } from "../Model/AuthModels";

export const getSessionHandler = catchError(async (req, res) => {
  const userId = req.userId as string;
  appAssert(userId, NOT_FOUND, "Session is not exist!");

  const session = await SessionCodeModel.findAll({
    where: { userId, expiresAt: { [Op.gt]: new Date() } },
    attributes: ["id", "userAgent", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
  appAssert(session, NOT_FOUND, "Session not found");

  // the user should delete the session which is the current session.
  const currentSession = session.map((s) => ({
    ...s.toJSON(),
    ...(s.dataValues.id === req.sessionId && { isCurrent: true }),
  }));

  return res.status(OK).json(currentSession);
});

export const deleteSessionHandler = catchError(async (req, res) => {
  const sessionId = z.string().parse(req.params.id);
  const userId = req.userId as string | undefined;
  appAssert(sessionId, NOT_FOUND, "Session ID is required!");

  const session = await SessionCodeModel.destroy({
    where: { id: sessionId, userId },
  });

  appAssert(session, NOT_FOUND, "Session not found!");
  return res.status(OK).json({ message: "Session deleted successfully!" });
});
