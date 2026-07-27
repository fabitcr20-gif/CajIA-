/**
 * Google Drive export — client side.
 *
 * All of the actual OAuth handshake and Drive API calls happen server-side
 * (see src/app/api/auth/google/* and src/app/api/drive/*, backed by
 * src/lib/google/*). Access and refresh tokens never reach the browser: they
 * live only in an httpOnly, encrypted session cookie set by those routes.
 * This module just talks to that API surface.
 */
import { GoogleReturnPath } from "@/lib/google/returnPaths";

export interface DriveStatus {
  connected: boolean;
}

export async function getDriveStatus(): Promise<DriveStatus> {
  try {
    const res = await fetch("/api/drive/status", { cache: "no-store" });
    if (!res.ok) return { connected: false };
    return (await res.json()) as DriveStatus;
  } catch {
    return { connected: false };
  }
}

// Full-page navigation, not fetch: this has to end on Google's own consent
// screen, which only works as a top-level browser navigation.
export function getGoogleConnectUrl(returnTo: GoogleReturnPath): string {
  return `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
}

export async function disconnectGoogleDrive(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/google/disconnect", { method: "POST" });
    if (!res.ok) return false;
    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}

export type DriveExportErrorCode = "not_connected" | "reauth_required" | "insufficient_scope" | "upload_failed";

export interface DriveExportSuccess {
  success: true;
  fileId: string;
  webViewLink: string;
}

export interface DriveExportFailure {
  success: false;
  error: DriveExportErrorCode;
  message: string;
}

export async function exportPdfToDrive(pdfBlob: Blob, fileName: string): Promise<DriveExportSuccess | DriveExportFailure> {
  try {
    const formData = new FormData();
    formData.append("file", pdfBlob, fileName);
    formData.append("fileName", fileName);

    const res = await fetch("/api/drive/export", { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok && data.success) {
      return data as DriveExportSuccess;
    }
    return {
      success: false,
      error: (data.error as DriveExportErrorCode) ?? "upload_failed",
      message: data.message ?? "No pudimos subir el informe a Google Drive. Intenta nuevamente.",
    };
  } catch {
    return {
      success: false,
      error: "upload_failed",
      message: "No pudimos subir el informe a Google Drive. Revisa tu conexión e intenta nuevamente.",
    };
  }
}

// Maps the `drive_error` query param set by /api/auth/google/callback (after
// redirecting back into the app) to a friendly message.
export function describeGoogleOAuthError(code: string | null): string {
  switch (code) {
    case "access_denied":
      return "Cancelaste la conexión con Google. Puedes intentarlo de nuevo cuando quieras.";
    case "invalid_state":
      return "La solicitud de conexión expiró o no es válida. Intenta conectar de nuevo.";
    case "exchange_failed":
      return "No pudimos completar la conexión con Google. Intenta nuevamente.";
    case "not_configured":
      return "La integración con Google Drive todavía no está configurada.";
    default:
      return "No pudimos conectar con Google. Intenta nuevamente.";
  }
}
