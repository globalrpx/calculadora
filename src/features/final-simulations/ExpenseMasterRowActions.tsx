"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog, ConfirmSubmitButton } from "@/components/ui/ConfirmDialog";
import {
  archiveOrDeactivateExpensePresetAction,
  archiveOrDeactivateExpenseTypeAction
} from "./actions";

export function ExpenseTypeRowActions({
  expenseTypeId,
  label,
  isActive
}: {
  expenseTypeId: string;
  label: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const deactivate = async (formData: FormData) => {
    await archiveOrDeactivateExpenseTypeAction(formData);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-3 whitespace-nowrap">
      <Link
        href={`/admin/cadastros/tipos-despesa/${expenseTypeId}/editar`}
        className="font-semibold text-rpx-blue transition hover:text-rpx-navy"
      >
        Editar
      </Link>
      {isActive ? (
        <ConfirmDialog
          triggerLabel="Inativar"
          title="Inativar tipo de despesa"
          description={`Tem certeza que deseja inativar ${label}?`}
        >
          <form action={deactivate}>
            <input type="hidden" name="expenseTypeId" value={expenseTypeId} />
            <ConfirmSubmitButton label="Inativar" />
          </form>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}

export function ExpensePresetRowActions({
  expensePresetId,
  label,
  isActive
}: {
  expensePresetId: string;
  label: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const deactivate = async (formData: FormData) => {
    await archiveOrDeactivateExpensePresetAction(formData);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-3 whitespace-nowrap">
      <Link
        href={`/admin/cadastros/pre-calculos-despesas/${expensePresetId}/editar`}
        className="font-semibold text-rpx-blue transition hover:text-rpx-navy"
      >
        Editar
      </Link>
      {isActive ? (
        <ConfirmDialog
          triggerLabel="Inativar"
          title="Inativar pré-cálculo"
          description={`Tem certeza que deseja inativar ${label}?`}
        >
          <form action={deactivate}>
            <input type="hidden" name="expensePresetId" value={expensePresetId} />
            <ConfirmSubmitButton label="Inativar" />
          </form>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}
