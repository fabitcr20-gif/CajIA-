"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "24px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#172033" }}>Algo salió mal</h1>
          <p style={{ marginTop: 8, color: "#5b7099", maxWidth: 360 }}>
            No pudimos completar esta operación. Intenta nuevamente.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "12px 24px",
              borderRadius: 12,
              background: "#0d9488",
              color: "white",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
