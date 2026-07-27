import { NextRequest, NextResponse } from "next/server";
import { createOAuth2Client } from "@/lib/google/oauthClient";
import { getCajiaSession } from "@/lib/google/session";
import { GoogleConfigError } from "@/lib/google/env";
import { sanitizeReturnPath } from "@/lib/google/returnPaths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseState(state: string | null) {
  if (!state || !state.includes(".")) return { nonce: null, returnTo: sanitizeReturnPath(null) };
  const [nonce, encodedReturnTo] = state.split(".");
  return { nonce, returnTo: sanitizeReturnPath(decodeURIComponent(encodedReturnTo ?? "")) };
}

// GET /api/auth/google/callback — Google redirects here after the user
// approves or denies the consent screen.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const { nonce, returnTo } = parseState(params.get("state"));
  const redirectBase = new URL(returnTo, request.url);

  // The user clicked "Cancel" / "Deny" on Google's consent screen.
  if (params.get("error")) {
    redirectBase.searchParams.set("drive_error", "access_denied");
    return NextResponse.redirect(redirectBase);
  }

  const code = params.get("code");
  if (!code || !nonce) {
    redirectBase.searchParams.set("drive_error", "invalid_state");
    return NextResponse.redirect(redirectBase);
  }

  try {
    const session = await getCajiaSession();
    const expectedNonce = session.oauthNonce;
    // One-time use: clear the nonce whether or not it matches, so a replayed
    // callback URL can never be used to re-trigger the exchange.
    session.oauthNonce = undefined;

    if (!expectedNonce || expectedNonce !== nonce) {
      await session.save();
      redirectBase.searchParams.set("drive_error", "invalid_state");
      return NextResponse.redirect(redirectBase);
    }

    const client = createOAuth2Client();
    const { tokens } = await client.getToken(code);

    if (!tokens.access_token) {
      redirectBase.searchParams.set("drive_error", "exchange_failed");
      await session.save();
      return NextResponse.redirect(redirectBase);
    }

    // Google only returns a refresh_token on the very first consent for a
    // given account/client pair; keep the previous one if this response
    // didn't include a new one (still covered here since prompt=consent
    // forces a fresh refresh_token on every connect, but this is the
    // correct fallback either way).
    const previousRefreshToken = session.google?.refreshToken;
    session.google = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? previousRefreshToken,
      expiryDate: tokens.expiry_date ?? Date.now() + 55 * 60 * 1000,
    };
    await session.save();

    redirectBase.searchParams.set("drive_connected", "1");
    return NextResponse.redirect(redirectBase);
  } catch (error) {
    const errorCode = error instanceof GoogleConfigError ? "not_configured" : "exchange_failed";
    redirectBase.searchParams.set("drive_error", errorCode);
    return NextResponse.redirect(redirectBase);
  }
}
