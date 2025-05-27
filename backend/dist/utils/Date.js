"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oneHoureFromNow = exports.fiveMinutesAgo = exports.ON_DAY_MS = exports.fifteenMinutesFromNow = exports.thirtyDaysFromNow = exports.oneYearFromNow = void 0;
const now = new Date();
const oneYearFromNow = () => {
    return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
};
exports.oneYearFromNow = oneYearFromNow;
const thirtyDaysFromNow = () => {
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
};
exports.thirtyDaysFromNow = thirtyDaysFromNow;
const fifteenMinutesFromNow = () => {
    return new Date(now.getTime() + 15 * 60 * 1000);
};
exports.fifteenMinutesFromNow = fifteenMinutesFromNow;
const ON_DAY_MS = () => 24 * 60 * 60 * 1000;
exports.ON_DAY_MS = ON_DAY_MS;
const fiveMinutesAgo = () => new Date(now.getTime() - 5 * 60 * 1000);
exports.fiveMinutesAgo = fiveMinutesAgo;
const oneHoureFromNow = () => new Date(now.getTime() + 60 * 60 * 1000);
exports.oneHoureFromNow = oneHoureFromNow;
