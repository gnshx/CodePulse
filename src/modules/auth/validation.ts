import { z } from "zod";

const username = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,24}$/, "Use 3–24 lowercase letters, numbers, or underscores.");

const email = z.string().trim().toLowerCase().email("Enter a valid email address.");
const password = z.string().min(8, "Password must be at least 8 characters.").max(128);

export const credentialsSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password,
});

const platformUsername = z
  .string()
  .trim()
  .max(64)
  .regex(/^[a-zA-Z0-9_-]*$/, "Usernames may only contain letters, numbers, hyphens, and underscores.");

export const profileUpdateSchema = z.object({
  leetcodeUsername: platformUsername,
  codeforcesUsername: platformUsername,
  gfgUsername: platformUsername,
  codechefUsername: platformUsername,
  atcoderUsername: platformUsername,
  githubUsername: platformUsername,
  bio: z.string().trim().max(500).optional(),
  isPublic: z.boolean().optional(),
});

export const registrationSchema = z
  .object({
    username,
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
