import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { TablePlaceholder } from "@/components/ui/TablePlaceholder";

export default function BrokersPage() {
  return (
    <>
      <PageHeader title="Despachantes" action={<Button>Novo despachante</Button>} />
      <TablePlaceholder columns={["Empresa", "Documento", "E-mail", "Telefone"]} />
    </>
  );
}
