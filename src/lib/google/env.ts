// Server-only. Never import this from a "use client" file — it reads
// GOOGLE_CLIENT_SECRET and SESSION_SECRET, which must never reach the browser.
// Reads are lazy (inside functions) so a missing var never breaks `next build`,
// only an actual request that needs it.

export class GoogleConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleConfigError";
  }
}

export interface GoogleOAuthEnv {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function getGoogleOAuthEnv(): GoogleOAuthEnv {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new GoogleConfigError(
      "Google OAuth no está configurado. Faltan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_REDIRECT_URI."
    );
  }

  return { clientId, clientSecret, redirectUri };
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new GoogleConfigError(
      "SESSION_SECRET no está configurado (o tiene menos de 32 caracteres). Es necesario para cifrar la sesión de Google Drive."
    );
  }
  return secret;
}
