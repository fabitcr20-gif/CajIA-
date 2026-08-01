import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CloudSyncProvider } from "@/components/providers/CloudSyncProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CajIA — Tu caja. Tus ventas. Tu negocio.",
  description: "Registra ventas, cierra tu caja y entiende tu negocio desde cualquier dispositivo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1e2c4d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CloudSyncProvider>{children}</CloudSyncProvider>
      </body>
    </html>
  );
}
