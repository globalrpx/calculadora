import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Painel administrativo"
        title="Dashboard RPX"
        description="Visão inicial estática para validar a fundação administrativa."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Clientes cadastrados" value="0" description="Cadastro real será conectado depois." />
        <Card title="Cotações recebidas" value="0" description="Aguardando módulo calculadora." />
        <Card title="Simulações em aberto" value="0" description="Fluxo interno futuro." />
        <Card title="Simulações publicadas" value="0" description="Histórico do cliente futuro." />
      </div>
    </>
  );
}
