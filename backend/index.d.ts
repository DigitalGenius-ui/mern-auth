import { DataType } from "sequelize";

declare global {
  namespace Express {
    interface Request {
      userId: DataType.UUID;
      sessionId: DataType.UUID;
    }
  }
}

export {};
