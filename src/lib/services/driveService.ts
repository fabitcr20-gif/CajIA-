/**
 * Google Drive export service.
 *
 * The real integration (Google OAuth + Drive API upload) isn't wired up yet.
 * This simulates the round trip with a realistic delay so the UI, states and
 * copy are already final — swapping `simulateExportToDrive`'s body for a real
 * `drive.files.create` call is the only change needed later.
 */
export interface DriveExportResult {
  success: true;
  message: string;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulateExportToDrive(_reportTitle: string): Promise<DriveExportResult> {
  await delay(1100);
  return {
    success: true,
    message:
      "En la versión completa, este informe se guardará directamente en tu carpeta de Google Drive.",
  };
}
