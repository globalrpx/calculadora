import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ClientHomePage() {
  return (
    <>
      <PageHeader
        eyebrow="Área do cliente"
        title="Bem-vindo a Global RPX"
        description="Acompanhe suas cotações preliminares e simulações preparadas pelo time RPX."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Cotações recentes" value="0" description="Histórico real será exibido na etapa da calculadora." />
        <Card title="Simulações disponíveis" value="0" description="Resultados publicados pela RPX aparecerão aqui." />
        <Card title="Próxima ação" value="Calculadora" description="Criar nova cotação será liberado na próxima fase." />
      </div>
    </>
  );
}
