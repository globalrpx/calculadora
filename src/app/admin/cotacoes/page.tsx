import { PageHeader } from "@/components/layout/PageHeader";
import { TablePlaceholder } from "@/components/ui/TablePlaceholder";

export default function QuotesPage() {
  return (
    <>
      <PageHeader title="Cotacoes" description="Cotacoes dos clientes serao listadas apos a implementacao da calculadora." />
      <TablePlaceholder columns={["Data", "Cliente", "Produto", "Status", "Economia estimada"]} />
    </>
  );
}
