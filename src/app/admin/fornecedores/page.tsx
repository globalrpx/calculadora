import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { TablePlaceholder } from "@/components/ui/TablePlaceholder";

export default function SuppliersPage() {
  return (
    <>
      <PageHeader title="Fornecedores" action={<Button>Novo fornecedor</Button>} />
      <TablePlaceholder columns={["Nome", "País", "Cidade", "Contato"]} />
    </>
  );
}
