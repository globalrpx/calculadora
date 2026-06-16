import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ClientHomePage() {
  return (
    <>
      <PageHeader
        eyebrow="Area do cliente"
        title="Bem-vindo a Global RPX"
        description="Acompanhe suas cotacoes preliminares e simulacoes preparadas pelo time RPX."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Cotacoes recentes" value="0" description="Historico real sera exibido na etapa da calculadora." />
        <Card title="Simulacoes disponiveis" value="0" description="Resultados publicados pela RPX aparecerao aqui." />
        <Card title="Proxima acao" value="Calculadora" description="Criar nova cotacao sera liberado na proxima fase." />
      </div>
    </>
  );
}
