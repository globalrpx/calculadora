import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { TablePlaceholder } from "@/components/ui/TablePlaceholder";

export default function SimulationsPage() {
  return (
    <>
      <PageHeader title="Simulações" action={<Button>Nova simulação</Button>} />
      <TablePlaceholder columns={["Título", "Cliente", "Status", "Publicado em"]} />
    </>
  );
}
