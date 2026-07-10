import { PageHeader } from "@/components/layout/PageHeader";
import { createFinalSimulationAction } from "@/features/final-simulations/actions";
import { FinalSimulationMainDataForm } from "@/features/final-simulations/FinalSimulationMainDataForm";
import { getFinalSimulationFormOptions } from "@/features/final-simulations/queries";

export default async function NewFinalSimulationPage() {
  const options = await getFinalSimulationFormOptions();

  return (
    <>
      <PageHeader
        title="Nova simulação final"
        description="Crie a base da simulação final em rascunho para evoluir produtos, despesas e cálculo nas próximas etapas."
      />

      <div className="max-w-5xl">
        <FinalSimulationMainDataForm
          action={createFinalSimulationAction}
          title="Dados principais"
          description="Dados comerciais e logísticos iniciais da simulação."
          submitLabel="Criar simulação"
          cancelHref="/admin/simulacoes-finais"
          redirectOnSuccess="detail"
          clients={options.clients}
          values={{
            currency: "USD",
            country: "BR",
            exchangeRate: 0
          }}
        />
      </div>
    </>
  );
}
