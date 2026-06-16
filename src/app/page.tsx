import type { Metadata } from "next";
import { HomeLanding } from "@/components/landing/HomeLanding";

export const metadata: Metadata = {
  title: "Calculadora de Importação Gratuita | Global RPX",
  description:
    "Simule o custo estimado de importação de produtos para o Brasil. Calcule impostos, câmbio e custo por unidade com uma ferramenta gratuita da Global RPX."
};

export default function HomePage() {
  return <HomeLanding />;
}
