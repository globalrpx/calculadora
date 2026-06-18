import { createAdminSimulationAction } from "@/lib/actions/admin";
import { getAdminSimulationFormOptions } from "@/lib/admin/queries";
import { SimulationFormCard } from "@/components/admin/SimulationForm";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function NewSimulationPage() {
  const options = await getAdminSimulationFormOptions();

  return (
    <>
      <PageHeader
        title="Nova simulação"
        description="Cadastre uma simulação administrativa básica usando os campos existentes no banco."
      />
      <div className="max-w-2xl">
        <SimulationFormCard
          action={createAdminSimulationAction}
          title="Dados da simulação"
          description="Vincule uma cotação quando quiser reutilizar produto, FOB, fornecedor e cálculo já recebidos."
          submitLabel="Salvar simulação"
          cancelHref="/admin/simulacoes"
          clients={options.clients}
          quotes={options.quotes}
          values={{
            clientId: "",
            quoteId: "",
            title: "",
            status: "aguardando",
            clientNotes: "",
            quoteFileUrl: ""
          }}
        />
      </div>
    </>
  );
}
