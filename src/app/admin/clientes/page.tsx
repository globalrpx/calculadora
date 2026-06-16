import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { TablePlaceholder } from "@/components/ui/TablePlaceholder";

export default function ClientsPage() {
  return (
    <>
      <PageHeader title="Clientes" action={<Button>Novo cliente</Button>} />
      <TablePlaceholder columns={["Empresa", "Contato", "E-mail", "Status"]} />
    </>
  );
}
