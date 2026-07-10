import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { updateExpensePresetAction } from "@/features/final-simulations/actions";
import { ExpensePresetForm } from "@/features/final-simulations/ExpensePresetForm";
import { ExpensePresetItemsSection } from "@/features/final-simulations/ExpensePresetItemsSection";
import {
  getExpensePresetById,
  getExpensePresetItems,
  listActiveExpenseTypes
} from "@/features/final-simulations/queries";
import type { ExpensePreset, ExpensePresetValues } from "@/features/final-simulations/types";

function mapExpensePresetToValues(expensePreset: ExpensePreset): ExpensePresetValues {
  return {
    expensePresetId: expensePreset.id,
    name: expensePreset.name,
    description: expensePreset.description ?? undefined,
    transportMode: expensePreset.transport_mode,
    isActive: expensePreset.is_active
  };
}

export default async function EditExpensePresetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [expensePreset, items, expenseTypes] = await Promise.all([
    getExpensePresetById(id),
    getExpensePresetItems(id),
    listActiveExpenseTypes()
  ]);

  if (!expensePreset) {
    notFound();
  }

  return (
    <>
      <PageHeader title={`Editar ${expensePreset.name}`} description="Atualize o pré-cálculo e gerencie seus itens." />

      <div className="grid gap-6">
        <div className="max-w-4xl">
          <ExpensePresetForm
            action={updateExpensePresetAction}
            title="Dados do pré-cálculo"
            description="A edição afeta o cadastro mestre usado por novos processamentos."
            submitLabel="Salvar alterações"
            cancelHref="/admin/cadastros/pre-calculos-despesas"
            successRedirectHref="/admin/cadastros/pre-calculos-despesas"
            values={mapExpensePresetToValues(expensePreset)}
          />
        </div>

        <ExpensePresetItemsSection presetId={expensePreset.id} items={items} expenseTypes={expenseTypes} />
      </div>
    </>
  );
}
