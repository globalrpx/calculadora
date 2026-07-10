"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog, ConfirmSubmitButton } from "@/components/ui/ConfirmDialog";
import { toggleInvoiceParametrizationStatusAction } from "./actions";

export function InvoiceParametrizationRowActions({
  invoiceParametrizationId,
  label,
  isActive
}: {
  invoiceParametrizationId: string;
  label: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const toggleStatus = async (formData: FormData) => {
    await toggleInvoiceParametrizationStatusAction(formData);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-3 whitespace-nowrap">
      <Link
        href={`/admin/cadastros/parametrizacoes-fiscais/${invoiceParametrizationId}/editar`}
        className="font-semibold text-rpx-blue transition hover:text-rpx-navy"
      >
        Editar
      </Link>
      <ConfirmDialog
        triggerLabel={isActive ? "Inativar" : "Ativar"}
        title={isActive ? "Inativar parametrização fiscal" : "Ativar parametrização fiscal"}
        description={`Tem certeza que deseja ${isActive ? "inativar" : "ativar"} ${label}?`}
      >
        <form action={toggleStatus}>
          <input type="hidden" name="invoiceParametrizationId" value={invoiceParametrizationId} />
          <input type="hidden" name="isActive" value={isActive ? "false" : "true"} />
          <ConfirmSubmitButton label={isActive ? "Inativar" : "Ativar"} />
        </form>
      </ConfirmDialog>
    </div>
  );
}
