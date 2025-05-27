import { Op } from "sequelize";
import { NOT_FOUND } from "../constants/http";
import { SessionCodeModel } from "../Model/AuthModels";
import appAssert from "../utils/AppAssert";

export const getSession = async (userId: string) => {
  const session = await SessionCodeModel.findAll({
    where: { userId, expiresAt: { [Op.gt]: new Date() } },
    attributes: ["id", "userAgent", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
  appAssert(session, NOT_FOUND, "Session not found");
  return { session };
};

export const deleteSession = async (sessionId: string) => {
  const session = await SessionCodeModel.destroy({
    where: { id: sessionId },
  });
  appAssert(session, NOT_FOUND, "Session not found");
  return { session };
};
