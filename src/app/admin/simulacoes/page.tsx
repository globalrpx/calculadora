import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { TablePlaceholder } from "@/components/ui/TablePlaceholder";

export default function SimulationsPage() {
  return (
    <>
      <PageHeader title="Simulacoes" action={<Button>Nova simulacao</Button>} />
      <TablePlaceholder columns={["Titulo", "Cliente", "Status", "Publicado em"]} />
    </>
  );
}
