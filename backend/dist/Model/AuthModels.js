"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationCodeModel = exports.SessionCodeModel = exports.UserModel = void 0;
const sequelize_1 = require("sequelize");
const db_connection_1 = require("../config/db-connection");
exports.UserModel = db_connection_1.db.define("users", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userAgent: {
        type: sequelize_1.DataTypes.STRING,
    },
    verified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
});
exports.SessionCodeModel = db_connection_1.db.define("session", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    userAgent: {
        type: sequelize_1.DataTypes.STRING,
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, { timestamps: true });
exports.VerificationCodeModel = db_connection_1.db.define("verificationCode", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
});
exports.UserModel.hasOne(exports.SessionCodeModel);
exports.UserModel.hasOne(exports.VerificationCodeModel);
