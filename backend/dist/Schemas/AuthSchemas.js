"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidSchemas = exports.emailSchema = exports.verificationCodeSchema = exports.registerValidSchemas = exports.loginValidSchemas = void 0;
const zod_1 = require("zod");
const passwordSchema = zod_1.z.string().min(8).max(255);
exports.loginValidSchemas = zod_1.z.object({
    email: zod_1.z.string().email().min(1).max(255),
    password: passwordSchema,
    userAgent: zod_1.z.string().optional(),
});
exports.registerValidSchemas = exports.loginValidSchemas
    .extend({
    confirmPassword: zod_1.z.string().optional(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match!!",
    path: ["confirmPasword"],
});
exports.verificationCodeSchema = zod_1.z.string().min(1).max(36);
exports.emailSchema = zod_1.z.string().email();
exports.resetPasswordValidSchemas = zod_1.z.object({
    verificationCode: exports.verificationCodeSchema,
    password: passwordSchema,
});
