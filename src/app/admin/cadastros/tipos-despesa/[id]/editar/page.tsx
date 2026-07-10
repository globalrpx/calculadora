import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { updateExpenseTypeAction } from "@/features/final-simulations/actions";
import { ExpenseTypeForm } from "@/features/final-simulations/ExpenseTypeForm";
import { getExpenseTypeById } from "@/features/final-simulations/queries";
import type { ExpenseType, ExpenseTypeValues } from "@/features/final-simulations/types";

function mapExpenseTypeToValues(expenseType: ExpenseType): ExpenseTypeValues {
  return {
    expenseTypeId: expenseType.id,
    code: expenseType.code ?? undefined,
    description: expenseType.description,
    key: expenseType.key ?? undefined,
    printOrder: expenseType.print_order,
    expenseModality: expenseType.expense_modality,
    expenseModalityLabel: expenseType.expense_modality_label ?? undefined,
    allocationType: expenseType.allocation_type,
    allocationTypeLabel: expenseType.allocation_type_label ?? undefined,
    expenseCalculationType: expenseType.expense_calculation_type,
    expenseCalculationLabel: expenseType.expense_calculation_label ?? undefined,
    ownImportBehavior: expenseType.own_import_behavior,
    ownImportBehaviorLabel: expenseType.own_import_behavior_label ?? undefined,
    orderAccountBehavior: expenseType.order_account_behavior,
    orderAccountBehaviorLabel: expenseType.order_account_behavior_label ?? undefined,
    encomendaBehavior: expenseType.encomenda_behavior,
    encomendaBehaviorLabel: expenseType.encomenda_behavior_label ?? undefined,
    expenseResulting: expenseType.expense_resulting ?? undefined,
    siscomexAdditionId: expenseType.siscomex_addition_id ?? undefined,
    expenseGroupId: expenseType.expense_group_id ?? undefined,
    expenseGroupName: expenseType.expense_group_name ?? undefined,
    considersContainer: expenseType.considers_container,
    considersIcmsEntryInvoice: expenseType.considers_icms_entry_invoice,
    composesServiceInvoice: expenseType.composes_service_invoice,
    titleTypeId: expenseType.title_type_id ?? undefined,
    titleTypeName: expenseType.title_type_name ?? undefined,
    serviceId: expenseType.service_id ?? undefined,
    serviceName: expenseType.service_name ?? undefined,
    bankAccountId: expenseType.bank_account_id ?? undefined,
    bankAccountName: expenseType.bank_account_name ?? undefined,
    erpKey: expenseType.erp_key ?? undefined,
    paidByCashOwnImport: expenseType.paid_by_cash_own_import,
    paidByCashEncomenda: expenseType.paid_by_cash_encomenda,
    paidByCashOrderAccount: expenseType.paid_by_cash_order_account,
    paidByCashDirectExport: expenseType.paid_by_cash_direct_export,
    paidByCashIndirectExport: expenseType.paid_by_cash_indirect_export,
    isActive: expenseType.is_active
  };
}

export default async function EditExpenseTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expenseType = await getExpenseTypeById(id);

  if (!expenseType) {
    notFound();
  }

  return (
    <>
      <PageHeader title={`Editar ${expenseType.description}`} description="Atualize o tipo mestre de despesa." />

      <div className="max-w-6xl">
        <ExpenseTypeForm
          action={updateExpenseTypeAction}
          title="Dados do tipo"
          description="A edição afeta o cadastro mestre usado por novos pré-cálculos."
          submitLabel="Salvar alterações"
          cancelHref="/admin/cadastros/tipos-despesa"
          successRedirectHref="/admin/cadastros/tipos-despesa"
          values={mapExpenseTypeToValues(expenseType)}
        />
      </div>
    </>
  );
}
