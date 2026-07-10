import { PageHeader } from "@/components/layout/PageHeader";
import { createExpensePresetAction } from "@/features/final-simulations/actions";
import { ExpensePresetForm } from "@/features/final-simulations/ExpensePresetForm";

export default async function NewExpensePresetPage() {
  return (
    <>
      <PageHeader title="Novo pré-cálculo de despesas" description="Cadastre um preset mestre de despesas por via de transporte." />

      <div className="max-w-4xl">
        <ExpensePresetForm
          action={createExpensePresetAction}
          title="Dados do pré-cálculo"
          description="Depois de criar, edite o cadastro para adicionar os itens do preset."
          submitLabel="Criar pré-cálculo"
          cancelHref="/admin/cadastros/pre-calculos-despesas"
          successRedirectHref="/admin/cadastros/pre-calculos-despesas"
          values={{
            transportMode: "maritimo",
            isActive: true
          }}
        />
      </div>
    </>
  );
}
