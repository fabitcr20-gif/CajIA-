// Shared by the client (driveService.ts, to build the "Conectar con Google"
// link) and the /api/auth/google route handler (to validate it). Plain
// strings only — safe to import from either side.
export const GOOGLE_RETURN_PATHS = ["/cierres", "/cierres/mensual", "/configuracion"] as const;

export type GoogleReturnPath = (typeof GOOGLE_RETURN_PATHS)[number];

export function sanitizeReturnPath(value: string | null | undefined): GoogleReturnPath {
  if (value && (GOOGLE_RETURN_PATHS as readonly string[]).includes(value)) {
    return value as GoogleReturnPath;
  }
  return "/cierres";
}
