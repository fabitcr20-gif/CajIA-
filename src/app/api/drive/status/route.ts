import { NextResponse } from "next/server";
import { getCajiaSession } from "@/lib/google/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/drive/status — tells the client whether a Google Drive account is
// connected. Never returns the tokens themselves.
export async function GET() {
  try {
    const session = await getCajiaSession();
    return NextResponse.json({ connected: !!session.google });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
