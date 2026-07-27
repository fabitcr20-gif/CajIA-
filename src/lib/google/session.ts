import { cookies } from "next/headers";
import { getIronSession, type IronSession } from "iron-session";
import { getSessionSecret } from "@/lib/google/env";

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  // ms since epoch
  expiryDate: number;
}

export interface CajiaSessionData {
  google?: GoogleTokens;
  // Short-lived CSRF nonce for the OAuth handshake; cleared right after the
  // callback verifies it, whether the verification succeeds or fails.
  oauthNonce?: string;
}

const COOKIE_NAME = "cajia_google_session";

export async function getCajiaSession(): Promise<IronSession<CajiaSessionData>> {
  const cookieStore = await cookies();
  return getIronSession<CajiaSessionData>(cookieStore, {
    cookieName: COOKIE_NAME,
    password: getSessionSecret(),
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // Refresh tokens are long-lived; keep the session around accordingly.
      // The access token itself is refreshed on demand, never trusted past its own expiry.
      maxAge: 60 * 60 * 24 * 90,
    },
  });
}
