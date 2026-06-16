import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ClientSimulationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Cliente"
        title="Módulo Simulações"
        description="Aqui o cliente verá simulações publicadas pelo time RPX."
      />
      <Card description="As simulações reais serão conectadas ao Supabase em uma etapa posterior." />
    </>
  );
}
