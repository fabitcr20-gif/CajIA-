import { NextRequest, NextResponse } from "next/server";
import { getCajiaSession } from "@/lib/google/session";
import { uploadPdfToDrive } from "@/lib/google/driveClient";
import { GoogleNotConnectedError, GoogleReauthRequiredError } from "@/lib/google/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB, generous for a text+chart PDF report

// POST /api/drive/export — multipart/form-data with fields:
//   file: the PDF Blob (same bytes the "Descargar PDF" button produces)
//   fileName: desired file name in Drive
export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: "upload_failed", message: "No pudimos leer el archivo enviado." }, { status: 400 });
  }

  const file = formData.get("file");
  const fileNameField = formData.get("fileName");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ success: false, error: "upload_failed", message: "No se recibió un archivo PDF válido." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ success: false, error: "upload_failed", message: "El archivo es demasiado grande." }, { status: 400 });
  }

  const fileName = typeof fileNameField === "string" && fileNameField.trim() ? fileNameField.trim() : "CajIA-informe.pdf";

  try {
    const session = await getCajiaSession();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { fileId, webViewLink } = await uploadPdfToDrive(session, buffer, fileName);
    return NextResponse.json({ success: true, fileId, webViewLink });
  } catch (error) {
    if (error instanceof GoogleNotConnectedError) {
      return NextResponse.json(
        { success: false, error: "not_connected", message: "Conecta tu cuenta de Google Drive para exportar el informe." },
        { status: 401 }
      );
    }
    if (error instanceof GoogleReauthRequiredError) {
      return NextResponse.json(
        { success: false, error: "reauth_required", message: "Tu conexión con Google Drive expiró. Conéctate de nuevo." },
        { status: 401 }
      );
    }
    const status = (error as { status?: number } | null)?.status;
    if (status === 403) {
      return NextResponse.json(
        { success: false, error: "insufficient_scope", message: "No tenemos permiso para subir archivos a tu Google Drive. Reconecta tu cuenta." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: "upload_failed", message: "No pudimos subir el informe a Google Drive. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
