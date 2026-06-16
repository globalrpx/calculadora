import { CalculatorClient } from "@/components/calculator/CalculatorClient";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireRole } from "@/lib/auth/get-session-profile";

export default async function CalculatorPage() {
  const { profile } = await requireRole("client");

  return (
    <>
      <PageHeader
        eyebrow="Cliente"
        title="Calculadora"
        description="Crie cotacoes preliminares e compare o valor de importacao direta com o valor comprando via RPX."
      />
      <CalculatorClient userEmail={profile.email ?? "cliente1@gmail.com"} />
    </>
  );
}
