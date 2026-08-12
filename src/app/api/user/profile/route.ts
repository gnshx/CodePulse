import { auth } from "@/modules/auth/config";
import { prisma } from "@/shared/db/client";
import { inngest } from "@/lib/inngest";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  leetcodeUsername: z.string().optional(),
  codeforcesUsername: z.string().optional(),
  gfgUsername: z.string().optional(),
  codechefUsername: z.string().optional(),
  atcoderUsername: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
  return NextResponse.json({ success: true, data: profile });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: { userId: session.user.id, ...parsed.data },
  });

  // Trigger background data refresh
  await inngest.send({
    name: "platform/refresh.requested",
    data: { userId: session.user.id },
  });

  return NextResponse.json({ success: true, data: profile });
}
