import Link from "next/link";
import { softDeleteClientAction } from "@/lib/actions/admin";
import { ConfirmDialog, ConfirmSubmitButton } from "@/components/ui/ConfirmDialog";

export function ClientRowActions({
  clientId,
  clientLabel
}: {
  clientId: string;
  clientLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 whitespace-nowrap">
      <Link href={`/admin/clientes/${clientId}`} className="text-sm font-semibold text-rpx-blue transition hover:text-rpx-navy">
        Editar
      </Link>
      <ConfirmDialog
        triggerLabel="Excluir"
        title="Excluir cliente"
        description={`Isso vai desativar o cliente ${clientLabel} e bloquear o acesso do usuário vinculado, quando existir. Deseja continuar?`}
      >
        <form action={softDeleteClientAction}>
          <input type="hidden" name="clientId" value={clientId} />
          <ConfirmSubmitButton />
        </form>
      </ConfirmDialog>
    </div>
  );
}
