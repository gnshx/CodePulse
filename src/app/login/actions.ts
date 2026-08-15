"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/modules/auth/config";
import { hashPassword } from "@/modules/auth/password";
import { credentialsSchema, registrationSchema } from "@/modules/auth/validation";
import { prisma } from "@/shared/db/client";

function loginError(message: string, mode: "signin" | "signup" = "signup") {
  return `/login?mode=${mode}&error=${encodeURIComponent(message)}`;
}

export async function signInWithPassword(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(loginError("Incorrect username, email, or password.", "signin"));
  }

  await signIn("credentials", {
    identifier: parsed.data.identifier,
    password: parsed.data.password,
    redirectTo: "/dashboard",
  });
}

export async function registerWithPassword(formData: FormData) {
  const parsed = registrationSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect(loginError(parsed.error.issues[0]?.message ?? "Check the details you entered."));
  }

  const { username, email, password } = parsed.data;
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true },
  });

  if (existingUser) {
    redirect(loginError("That email or username is already in use."));
  }

  try {
    await prisma.user.create({
      data: {
        email,
        username,
        name: username,
        passwordHash: await hashPassword(password),
        profile: { create: {} },
      },
    });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      redirect(loginError("That email or username is already in use."));
    }
    throw error;
  }

  await signIn("credentials", { identifier: email, password, redirectTo: "/dashboard" });
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signInWithGitHub() {
  await signIn("github", { redirectTo: "/dashboard" });
}
