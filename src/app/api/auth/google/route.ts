import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildGoogleConsentUrl } from "@/lib/google/oauthClient";
import { getCajiaSession } from "@/lib/google/session";
import { GoogleConfigError } from "@/lib/google/env";
import { sanitizeReturnPath } from "@/lib/google/returnPaths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/auth/google?returnTo=/cierres
// Starts the OAuth handshake: stash a CSRF nonce in the session, then send
// the browser to Google's consent screen. The nonce (plus the validated
// returnTo) travels in the `state` param and is checked back in /callback.
export async function GET(request: NextRequest) {
  const returnTo = sanitizeReturnPath(request.nextUrl.searchParams.get("returnTo"));

  try {
    const session = await getCajiaSession();
    const nonce = randomBytes(16).toString("hex");
    session.oauthNonce = nonce;
    await session.save();

    const state = `${nonce}.${encodeURIComponent(returnTo)}`;
    const consentUrl = buildGoogleConsentUrl(state);
    return NextResponse.redirect(consentUrl);
  } catch (error) {
    if (error instanceof GoogleConfigError) {
      return NextResponse.redirect(new URL(`${returnTo}?drive_error=not_configured`, request.url));
    }
    return NextResponse.redirect(new URL(`${returnTo}?drive_error=unknown`, request.url));
  }
}
