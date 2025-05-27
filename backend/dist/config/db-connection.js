"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const env_1 = require("../constants/env");
const sequelize_1 = require("sequelize");
exports.db = new sequelize_1.Sequelize(env_1.DB_NAME, env_1.DB_USER, env_1.DB_PASSWORD, {
    host: env_1.DB_HOST,
    dialect: "mysql",
    logging: false,
});
const connection = async () => {
    try {
        await exports.db.authenticate();
        // create my tabels based on schemas
        await exports.db.sync({ alter: true });
        console.log("Connection has been established successfully.");
    }
    catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};
connection();
