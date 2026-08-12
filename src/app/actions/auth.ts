"use server";

import { signOut } from "@/modules/auth/config";

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}
