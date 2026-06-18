import Link from "next/link";
import { deactivateAdminUserAction, reactivateAdminUserAction } from "@/lib/actions/admin";
import { ConfirmDialog, ConfirmSubmitButton } from "@/components/ui/ConfirmDialog";

export function AdminUserRowActions({
  userId,
  userLabel,
  status,
  redirectTo,
  isCurrentUser
}: {
  userId: string;
  userLabel: string;
  status: string;
  redirectTo: string;
  isCurrentUser: boolean;
}) {
  return (
    <div className="flex items-center gap-3 whitespace-nowrap">
      <Link href={`/admin/usuarios/${userId}`} className="text-sm font-semibold text-rpx-blue transition hover:text-rpx-navy">
        Editar
      </Link>
      {status === "active" ? (
        <ConfirmDialog
          triggerLabel="Inativar"
          title="Inativar usuário admin"
          description={
            isCurrentUser
              ? "Esta é a sua própria conta. A tentativa será bloqueada por segurança."
              : `Tem certeza que deseja inativar o usuário ${userLabel}? O acesso ao painel será bloqueado.`
          }
        >
          <form action={deactivateAdminUserAction}>
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <ConfirmSubmitButton label="Inativar" />
          </form>
        </ConfirmDialog>
      ) : (
        <form action={reactivateAdminUserAction}>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button type="submit" className="text-sm font-semibold text-rpx-blue transition hover:text-rpx-navy">
            Reativar
          </button>
        </form>
      )}
    </div>
  );
}
