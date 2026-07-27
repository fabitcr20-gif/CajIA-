import { google } from "googleapis";
import { getGoogleOAuthEnv } from "@/lib/google/env";

// Least-privilege scope: access only to files this app creates/opens itself.
// Never request broader Drive scopes (e.g. drive.readonly or drive) for a
// feature that only needs to upload PDFs it generated.
export const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

export function createOAuth2Client() {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthEnv();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function buildGoogleConsentUrl(state: string): string {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline", // request a refresh_token
    prompt: "consent", // force refresh_token even on repeat authorizations
    scope: [GOOGLE_DRIVE_SCOPE],
    state,
  });
}
