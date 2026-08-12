import { auth } from "@/modules/auth/config";
import { getAnalytics } from "@/modules/analytics/service";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const analytics = await getAnalytics(session.user.id);
  return NextResponse.json({ success: true, data: analytics });
}
