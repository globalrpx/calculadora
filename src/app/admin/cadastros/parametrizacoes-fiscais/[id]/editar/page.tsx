import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { updateInvoiceParametrizationAction } from "@/features/final-simulations/actions";
import { InvoiceParametrizationForm } from "@/features/final-simulations/InvoiceParametrizationForm";
import { getInvoiceParametrizationById } from "@/features/final-simulations/queries";
import type {
  InvoiceParametrization,
  InvoiceParametrizationFormInput
} from "@/features/final-simulations/types";

function mapInvoiceParametrizationToValues(
  invoiceParametrization: InvoiceParametrization
): InvoiceParametrizationFormInput {
  return {
    invoiceParametrizationId: invoiceParametrization.id,
    code: invoiceParametrization.code,
    key: invoiceParametrization.key ?? undefined,
    operationType: invoiceParametrization.operation_type,
    description: invoiceParametrization.description,
    operationNature: invoiceParametrization.operation_nature ?? undefined,
    cfop: invoiceParametrization.cfop ?? undefined,
    operationGroup: invoiceParametrization.operation_group ?? undefined,
    taxRegime: invoiceParametrization.tax_regime ?? undefined,
    icmsRate: invoiceParametrization.icms_rate,
    destinationScope: invoiceParametrization.destination_scope ?? undefined,
    customerProfile: invoiceParametrization.customer_profile ?? undefined,
    isUnified: invoiceParametrization.is_unified,
    branchId: invoiceParametrization.branch_id ?? undefined,
    branchName: invoiceParametrization.branch_name ?? undefined,
    customerId: invoiceParametrization.customer_id ?? undefined,
    customerName: invoiceParametrization.customer_name ?? undefined,
    isActive: invoiceParametrization.is_active,
    internalNotes: invoiceParametrization.internal_notes ?? undefined
  };
}

export default async function EditInvoiceParametrizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoiceParametrization = await getInvoiceParametrizationById(id);

  if (!invoiceParametrization) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={`Editar ${invoiceParametrization.code}`}
        description="Atualize a parametrização fiscal usada em novas seleções das Simulações Finais."
      />

      <div className="max-w-6xl">
        <InvoiceParametrizationForm
          action={updateInvoiceParametrizationAction}
          title="Dados fiscais"
          description="A edição afeta o cadastro mestre; simulações já salvas mantêm snapshots históricos."
          submitLabel="Salvar alterações"
          cancelHref="/admin/cadastros/parametrizacoes-fiscais"
          successRedirectHref="/admin/cadastros/parametrizacoes-fiscais"
          values={mapInvoiceParametrizationToValues(invoiceParametrization)}
        />
      </div>
    </>
  );
}
