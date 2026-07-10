import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { FinalSimulationItemsSection } from "@/features/final-simulations/FinalSimulationItemsSection";
import {
  getFinalSimulationById,
  getFinalSimulationItems,
  searchNcmCodes
} from "@/features/final-simulations/queries";
import { isFinalSimulationLocked } from "@/features/final-simulations/schemas";
import type { FinalSimulationRow } from "@/features/final-simulations/types";

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  in_review: "Em revisão",
  needs_adjustment: "Ajuste necessário",
  approved: "Aprovada",
  sent_to_customer: "Enviada ao cliente",
  archived: "Arquivada"
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function formatNumber(value: number | null | undefined, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(value ?? 0);
}

function formatMoney(value: number | null | undefined, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2
  }).format(value ?? 0);
}

function mapStatusVariant(status: string): "success" | "neutral" | "warning" | "info" {
  switch (status) {
    case "approved":
    case "sent_to_customer":
      return "success";
    case "in_review":
      return "info";
    case "needs_adjustment":
      return "warning";
    case "archived":
    case "draft":
    default:
      return "neutral";
  }
}

function DetailItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-rpx-ink">{value || "-"}</dd>
    </div>
  );
}

function buildTitle(simulation: FinalSimulationRow) {
  if (simulation.code) {
    return simulation.code;
  }

  return simulation.number ? `Simulação final ${simulation.number}` : "Simulação final";
}

function readSearchParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" ? value.trim() : "";
}

export default async function FinalSimulationDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const queryParams = await searchParams;
  const simulation = await getFinalSimulationById(id);

  if (!simulation) {
    notFound();
  }

  const ncmSearch = readSearchParam(queryParams, "ncmSearch");
  const [items, ncmOptions] = await Promise.all([
    getFinalSimulationItems(simulation.id),
    ncmSearch.length >= 2 ? searchNcmCodes(ncmSearch, 20) : Promise.resolve([])
  ]);
  const canEdit = !isFinalSimulationLocked(simulation.status);

  return (
    <>
      <PageHeader
        title={buildTitle(simulation)}
        description="Detalhe inicial da simulação final."
        action={
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/admin/simulacoes-finais" variant="secondary">
              Voltar
            </ButtonLink>
            <ButtonLink href={`/admin/simulacoes-finais/${simulation.id}/editar`}>Editar dados principais</ButtonLink>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Dados principais">
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">Status</dt>
              <dd className="mt-1">
                <StatusBadge variant={mapStatusVariant(simulation.status)}>
                  {statusLabels[simulation.status] ?? simulation.status}
                </StatusBadge>
              </dd>
            </div>
            <DetailItem label="Cliente" value={simulation.customer_name} />
            <DetailItem label="Fornecedor" value={simulation.supplier_name} />
            <DetailItem label="Data da cotação" value={formatDate(simulation.quote_date)} />
            <DetailItem label="Validade" value={formatDate(simulation.valid_until)} />
            <DetailItem label="Modalidade" value={simulation.import_modality} />
            <DetailItem label="Via de transporte" value={simulation.transport_mode} />
            <DetailItem label="Origem" value={simulation.origin} />
            <DetailItem label="Destino" value={simulation.destination} />
            <DetailItem label="Destino final" value={simulation.final_destination} />
            <DetailItem label="Estado destino" value={simulation.destination_state} />
            <DetailItem label="País" value={simulation.country} />
            <DetailItem label="Incoterm" value={simulation.incoterm} />
            <DetailItem label="Moeda" value={simulation.currency} />
            <DetailItem label="Câmbio" value={formatNumber(simulation.exchange_rate, { maximumFractionDigits: 6 })} />
          </dl>

          {simulation.notes ? (
            <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-xs font-semibold uppercase text-slate-500">Observações</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{simulation.notes}</p>
            </div>
          ) : null}
        </Card>

        <div className="grid gap-5">
          <Card title="Totais básicos">
            <dl className="mt-4 grid gap-4">
              <DetailItem label="Produtos USD" value={formatMoney(simulation.total_products_usd, "USD")} />
              <DetailItem label="Peso bruto" value={`${formatNumber(simulation.gross_weight)} kg`} />
              <DetailItem label="Peso líquido" value={`${formatNumber(simulation.net_weight)} kg`} />
              <DetailItem label="Impostos BRL" value={formatMoney(simulation.total_taxes_brl)} />
              <DetailItem label="Despesas BRL" value={formatMoney(simulation.total_expenses_brl)} />
              <DetailItem label="Custo total BRL" value={formatMoney(simulation.total_cost_brl)} />
            </dl>
          </Card>

          <Card title="Próximas etapas">
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Despesas, parametrização fiscal, impostos por encomenda, PDF cliente e relatório interno entram nas
              próximas etapas do módulo.
            </p>
          </Card>
        </div>
      </div>

      <FinalSimulationItemsSection
        simulationId={simulation.id}
        items={items}
        ncmOptions={ncmOptions}
        ncmSearch={ncmSearch}
        canEdit={canEdit}
      />
    </>
  );
}
