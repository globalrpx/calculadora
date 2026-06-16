import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Painel administrativo"
        title="Dashboard RPX"
        description="Visao inicial estatica para validar a fundacao administrativa."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Clientes cadastrados" value="0" description="Cadastro real sera conectado depois." />
        <Card title="Cotacoes recebidas" value="0" description="Aguardando modulo calculadora." />
        <Card title="Simulacoes em aberto" value="0" description="Fluxo interno futuro." />
        <Card title="Simulacoes publicadas" value="0" description="Historico do cliente futuro." />
      </div>
    </>
  );
}
