import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Please provide a valid email address").trim(),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().trim().min(10, "Phone number is required"),
});

export const loginSchema = z.object({
  email: z.email("Please provide a valid email address").trim(),
  password: z.string().trim().min(1, "Password is required"),
});
