import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "../constants/env";
import { Sequelize } from "sequelize";

export const db = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
});

const connection = async () => {
  try {
    await db.authenticate();
    // create my tabels based on schemas
    await db.sync({ alter: true });
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

connection();
