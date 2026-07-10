import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { updateFinalSimulationMainDataAction } from "@/features/final-simulations/actions";
import { FinalSimulationMainDataForm } from "@/features/final-simulations/FinalSimulationMainDataForm";
import { getFinalSimulationById, getFinalSimulationFormOptions } from "@/features/final-simulations/queries";
import { isFinalSimulationLocked } from "@/features/final-simulations/schemas";
import type { FinalSimulationMainDataValues, FinalSimulationRow } from "@/features/final-simulations/types";

function buildTitle(simulation: FinalSimulationRow) {
  if (simulation.code) {
    return `Editar ${simulation.code}`;
  }

  return simulation.number ? `Editar simulação final ${simulation.number}` : "Editar simulação final";
}

function mapSimulationToFormValues(simulation: FinalSimulationRow): FinalSimulationMainDataValues {
  return {
    simulationId: simulation.id,
    customerId: simulation.customer_id ?? undefined,
    customerName: simulation.customer_name ?? undefined,
    supplierName: simulation.supplier_name ?? undefined,
    branchName: simulation.branch_name ?? undefined,
    quoteDate: simulation.quote_date ?? undefined,
    validUntil: simulation.valid_until ?? undefined,
    operationType: simulation.operation_type ?? undefined,
    importModality: simulation.import_modality ?? undefined,
    goodsApplication: simulation.goods_application ?? undefined,
    transportMode: simulation.transport_mode ?? undefined,
    origin: simulation.origin ?? undefined,
    destination: simulation.destination ?? undefined,
    finalDestination: simulation.final_destination ?? undefined,
    destinationState: simulation.destination_state ?? undefined,
    destinationCity: simulation.destination_city ?? undefined,
    country: simulation.country ?? undefined,
    packaging: simulation.packaging ?? undefined,
    transitTime: simulation.transit_time ?? undefined,
    requiresImportLicense: simulation.requires_import_license,
    notes: simulation.notes ?? undefined,
    incoterm: simulation.incoterm ?? undefined,
    currency: simulation.currency ?? "USD",
    exchangeRate: simulation.exchange_rate
  };
}

export default async function EditFinalSimulationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const simulation = await getFinalSimulationById(id);

  if (!simulation) {
    notFound();
  }

  if (isFinalSimulationLocked(simulation.status)) {
    return (
      <>
        <PageHeader title={buildTitle(simulation)} description="Edição de dados principais da simulação final." />

        <Card title="Edição bloqueada" description="Esta simulação final não pode ser editada neste status.">
          <div className="mt-4">
            <ButtonLink href={`/admin/simulacoes-finais/${simulation.id}`} variant="secondary">
              Voltar para detalhe
            </ButtonLink>
          </div>
        </Card>
      </>
    );
  }

  const options = await getFinalSimulationFormOptions();

  return (
    <>
      <PageHeader
        title={buildTitle(simulation)}
        description="Atualize os dados principais da simulação final."
        action={
          <ButtonLink href={`/admin/simulacoes-finais/${simulation.id}`} variant="secondary">
            Voltar
          </ButtonLink>
        }
      />

      <div className="max-w-5xl">
        <FinalSimulationMainDataForm
          action={updateFinalSimulationMainDataAction}
          title="Dados principais"
          description="Somente simulações em rascunho, revisão ou ajuste podem ser editadas por este fluxo."
          submitLabel="Salvar alterações"
          cancelHref={`/admin/simulacoes-finais/${simulation.id}`}
          redirectOnSuccess="detail"
          clients={options.clients}
          values={mapSimulationToFormValues(simulation)}
        />
      </div>
    </>
  );
}
