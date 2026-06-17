import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { getClientDashboardStats } from "@/lib/client/quotes";

export default async function ClientHomePage() {
  const stats = await getClientDashboardStats();

  return (
    <>
      <PageHeader
        eyebrow="Área do cliente"
        title="Bem-vindo a Global RPX"
        description="Acompanhe suas cotações preliminares e simulações preparadas pelo time RPX."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          title="Cotações recentes"
          value={String(stats.quotesCount)}
          description="Histórico das cotações que você fez na Calculadora"
        />
        <Card
          title="Simulações disponíveis"
          value={String(stats.simulationsCount)}
          description="Total de simulações realizadas pela Global RPX"
        />
        <Card title="Próxima ação" value="Calculadora" description="Faça agora uma nova cotação de produtos" />
      </div>
      <ButtonLink href="/app/calculadora" className="mt-4 w-full">
        Fazer nova cotação na Calculadora
      </ButtonLink>
    </>
  );
}
