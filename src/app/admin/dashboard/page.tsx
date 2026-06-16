import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { getAdminDashboardStats } from "@/lib/admin/queries";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <>
      <PageHeader
        eyebrow="Painel administrativo"
        title="Dashboard RPX"
        description="Visão operacional inicial com totais reais do sistema administrativo."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Clientes cadastrados" value={String(stats.clientsCount)} description="Clientes cadastrados via site e pelo painel." />
        <Card title="Cotações recebidas" value={String(stats.quotesCount)} description="Registros persistidos no banco de dados." />
        <Card title="Simulação completa" value={String(stats.simulationRequestsCount)} description="Cotações com pedido de aprofundamento." />
        <Card title="Simulações publicadas" value={String(stats.publishedSimulationsCount)} description="Arquivos já liberados para o cliente." />
      </div>
    </>
  );
}
