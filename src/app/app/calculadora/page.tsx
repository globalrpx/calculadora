import { CalculatorClient } from "@/components/calculator/CalculatorClient";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireRole } from "@/lib/auth/get-session-profile";
import { getClientQuotes } from "@/lib/client/quotes";

export default async function CalculatorPage() {
  await requireRole("client");
  const quotes = await getClientQuotes();

  return (
    <>
      <PageHeader
        eyebrow="Cliente"
        title="Calculadora"
        description="Crie cotações preliminares e compare o valor de importação direta com o valor comprando via RPX."
      />
      <CalculatorClient initialQuotes={quotes} />
    </>
  );
}
