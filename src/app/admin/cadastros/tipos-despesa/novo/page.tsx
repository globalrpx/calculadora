import { PageHeader } from "@/components/layout/PageHeader";
import { createExpenseTypeAction } from "@/features/final-simulations/actions";
import { ExpenseTypeForm } from "@/features/final-simulations/ExpenseTypeForm";

export default async function NewExpenseTypePage() {
  return (
    <>
      <PageHeader title="Novo tipo de despesa" description="Cadastre um tipo mestre de despesa para pré-cálculos." />

      <div className="max-w-6xl">
        <ExpenseTypeForm
          action={createExpenseTypeAction}
          title="Dados do tipo"
          description="Defina classificação, comportamentos por modalidade e flags operacionais."
          submitLabel="Criar tipo"
          cancelHref="/admin/cadastros/tipos-despesa"
          successRedirectHref="/admin/cadastros/tipos-despesa"
          values={{
            printOrder: 0,
            expenseModality: "expense",
            allocationType: "value",
            expenseCalculationType: "parameters",
            ownImportBehavior: "not_applicable",
            orderAccountBehavior: "not_applicable",
            encomendaBehavior: "not_applicable",
            isActive: true
          }}
        />
      </div>
    </>
  );
}
