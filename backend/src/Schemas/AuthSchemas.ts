import { z } from "zod";

const passwordSchema = z.string().min(8).max(255);

export const loginValidSchemas = z.object({
  email: z.string().email().min(1).max(255),
  password: passwordSchema,
  userAgent: z.string().optional(),
});

export const registerValidSchemas = loginValidSchemas
  .extend({
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match!!",
    path: ["confirmPasword"],
  });

export const verificationCodeSchema = z.string().min(1).max(36);
export const emailSchema = z.string().email();

export const resetPasswordValidSchemas = z.object({
  verificationCode: verificationCodeSchema,
  password: passwordSchema,
});
