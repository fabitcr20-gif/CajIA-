import { NextResponse } from "next/server";
import { getCajiaSession } from "@/lib/google/session";
import { revokeGoogleConnection } from "@/lib/google/driveClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/auth/google/disconnect — revokes the token with Google (best
// effort) and always clears our local session, even if the revoke call fails.
export async function POST() {
  try {
    const session = await getCajiaSession();
    await revokeGoogleConnection(session);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
