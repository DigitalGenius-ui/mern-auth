"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const catchError = (contorller) => async (req, res, next) => {
    try {
        await contorller(req, res, next);
    }
    catch (error) {
        next(error);
    }
};
exports.default = catchError;
