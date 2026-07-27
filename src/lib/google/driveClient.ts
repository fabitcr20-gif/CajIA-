import { google } from "googleapis";
import { Readable } from "node:stream";
import type { IronSession } from "iron-session";
import { createOAuth2Client } from "@/lib/google/oauthClient";
import type { CajiaSessionData } from "@/lib/google/session";
import { GoogleNotConnectedError, GoogleReauthRequiredError } from "@/lib/google/errors";

async function getAuthorizedClient(session: IronSession<CajiaSessionData>) {
  const tokens = session.google;
  if (!tokens) throw new GoogleNotConnectedError();

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiryDate,
  });

  let accessToken: string | null | undefined;
  try {
    // Returns the current token if still valid, or transparently refreshes
    // it via the refresh_token if it has expired.
    ({ token: accessToken } = await oauth2Client.getAccessToken());
  } catch {
    // Google rejects the refresh (invalid_grant: revoked, expired, or the
    // user removed CajIA's access from their Google Account). The stored
    // connection is dead — drop it so the UI reverts to "Conectar con Google".
    session.google = undefined;
    await session.save();
    throw new GoogleReauthRequiredError();
  }

  if (!accessToken) {
    session.google = undefined;
    await session.save();
    throw new GoogleReauthRequiredError();
  }

  const refreshed = oauth2Client.credentials;
  if (refreshed.access_token && refreshed.access_token !== tokens.accessToken) {
    session.google = {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? tokens.refreshToken,
      expiryDate: refreshed.expiry_date ?? Date.now() + 55 * 60 * 1000,
    };
    await session.save();
  }

  return oauth2Client;
}

export async function uploadPdfToDrive(
  session: IronSession<CajiaSessionData>,
  fileBuffer: Buffer,
  fileName: string
): Promise<{ fileId: string; webViewLink: string }> {
  const auth = await getAuthorizedClient(session);
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.create({
    requestBody: { name: fileName, mimeType: "application/pdf" },
    media: { mimeType: "application/pdf", body: Readable.from(fileBuffer) },
    fields: "id, webViewLink",
  });

  const { id: fileId, webViewLink } = response.data;
  if (!fileId || !webViewLink) {
    throw new Error("Google Drive no devolvió un enlace de archivo válido.");
  }
  return { fileId, webViewLink };
}

export async function revokeGoogleConnection(session: IronSession<CajiaSessionData>): Promise<void> {
  const tokens = session.google;
  if (tokens) {
    try {
      const client = createOAuth2Client();
      await client.revokeToken(tokens.refreshToken ?? tokens.accessToken);
    } catch {
      // Best-effort: proceed to clear our local copy even if Google's revoke
      // call fails (token already dead, transient network error, etc.).
    }
  }
  session.google = undefined;
  await session.save();
}
