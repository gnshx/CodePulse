import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/config";
import { profileUpdateSchema } from "@/modules/auth/validation";
import { prisma } from "@/shared/db/client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid profile data." },
        { status: 400 },
      );
    }

    const {
      leetcodeUsername,
      codeforcesUsername,
      gfgUsername,
      codechefUsername,
      atcoderUsername,
      githubUsername,
      bio,
      isPublic,
    } = parsed.data;

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        leetcodeUsername,
        codeforcesUsername,
        gfgUsername,
        codechefUsername,
        atcoderUsername,
        githubUsername,
        bio,
        isPublic,
      },
      create: {
        userId: session.user.id,
        leetcodeUsername,
        codeforcesUsername,
        gfgUsername,
        codechefUsername,
        atcoderUsername,
        githubUsername,
        bio,
        isPublic,
      },
    });

    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
