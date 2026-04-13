import { z } from "zod";

export const updateUserStatusSchema = z.object({
  email: z.email("Please provide a valid email address").trim(),
});
