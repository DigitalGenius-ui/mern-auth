import { z } from "zod";

export const loginValidSchemas = z.object({
  email: z.string().email().min(1).max(255),
  password: z.string().min(8),
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
