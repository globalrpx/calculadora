import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { TablePlaceholder } from "@/components/ui/TablePlaceholder";

export default function UsersPage() {
  return (
    <>
      <PageHeader title="Usuários" action={<Button>Novo usuário</Button>} />
      <TablePlaceholder columns={["Nome", "E-mail", "Perfil", "Cliente"]} />
    </>
  );
}
