import { PageHeader } from "@/components/layout/PageHeader";
import { createInvoiceParametrizationAction } from "@/features/final-simulations/actions";
import { InvoiceParametrizationForm } from "@/features/final-simulations/InvoiceParametrizationForm";

export default async function NewInvoiceParametrizationPage() {
  return (
    <>
      <PageHeader
        title="Nova parametrização fiscal"
        description="Cadastre uma parametrização de NF entrada ou NF saída para Simulações Finais."
      />

      <div className="max-w-6xl">
        <InvoiceParametrizationForm
          action={createInvoiceParametrizationAction}
          title="Dados fiscais"
          description="Defina tipo, CFOP, regime, escopo e status da parametrização."
          submitLabel="Criar parametrização"
          cancelHref="/admin/cadastros/parametrizacoes-fiscais"
          successRedirectHref="/admin/cadastros/parametrizacoes-fiscais"
          values={{
            operationType: "entrada",
            icmsRate: 0,
            isUnified: false,
            isActive: true
          }}
        />
      </div>
    </>
  );
}
