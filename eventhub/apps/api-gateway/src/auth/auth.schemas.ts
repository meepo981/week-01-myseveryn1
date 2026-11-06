
import { z } from "zod";

const email = z.string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

export const registerBody = z.object({
  email,
  password: z.string().min(10).max(128)
});

export const loginBody = registerBody;

export type RegisterBody = z.infer<typeof registerBody>;
export type LoginBody = z.infer<typeof loginBody>;
