import Link from "next/link";
import { softDeleteClientAction } from "@/lib/actions/admin";
import { ConfirmDialog, ConfirmSubmitButton } from "@/components/ui/ConfirmDialog";

export function ClientRowActions({
  clientId,
  clientLabel,
  redirectTo
}: {
  clientId: string;
  clientLabel: string;
  redirectTo: string;
}) {
  return (
    <div className="flex items-center gap-3 whitespace-nowrap">
      <Link href={`/admin/clientes/${clientId}`} className="text-sm font-semibold text-rpx-blue transition hover:text-rpx-navy">
        Editar
      </Link>
      <ConfirmDialog
        triggerLabel="Inativar"
        title="Inativar cliente"
        description={`Tem certeza que deseja inativar o cliente ${clientLabel}? O acesso do usuário vinculado será bloqueado, quando existir.`}
      >
        <form action={softDeleteClientAction}>
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <ConfirmSubmitButton label="Inativar" />
        </form>
      </ConfirmDialog>
    </div>
  );
}
