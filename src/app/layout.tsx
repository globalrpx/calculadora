import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global RPX",
  description: "Plataforma Global RPX para cotacoes, simulacoes e operacao de importacao."
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
