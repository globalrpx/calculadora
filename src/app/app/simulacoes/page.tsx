import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ClientSimulationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Cliente"
        title="Modulo Simulacoes"
        description="Aqui o cliente vera simulacoes publicadas pelo time RPX."
      />
      <Card description="As simulacoes reais serao conectadas ao Supabase em uma etapa posterior." />
    </>
  );
}
