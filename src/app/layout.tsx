import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global RPX",
  description: "Plataforma Global RPX para cotações, simulações e operação de importação."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
