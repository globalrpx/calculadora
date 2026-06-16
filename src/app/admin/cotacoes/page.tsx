import { PageHeader } from "@/components/layout/PageHeader";
import { TablePlaceholder } from "@/components/ui/TablePlaceholder";

export default function QuotesPage() {
  return (
    <>
      <PageHeader title="Cotações" description="Cotações dos clientes serão listadas após a implementação da calculadora." />
      <TablePlaceholder columns={["Data", "Cliente", "Produto", "Status", "Economia estimada"]} />
    </>
  );
}
