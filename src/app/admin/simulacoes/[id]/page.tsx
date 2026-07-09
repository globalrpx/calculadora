import { notFound } from "next/navigation";
import { updateAdminSimulationAction } from "@/lib/actions/admin";
import { getAdminSimulationById, getAdminSimulationFormOptions } from "@/lib/admin/queries";
import { SimulationFormCard } from "@/components/admin/SimulationForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { simulationStatusOptions } from "@/lib/admin/simulation-form-state";
import { listSimulationUploads } from "@/lib/uploads/actions";
import { UploadsCard } from "@/components/uploads/UploadsCard";

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
  const formattedTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);

  return `${formattedDate} - ${formattedTime}`;
}

function formatMoney(value: number | null | undefined, currency: "BRL" | "USD" = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency
  }).format(value ?? 0);
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR").format(value ?? 0);
}

function formatPercent(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value ?? 0);
}

function mapStatus(status: string) {
  return simulationStatusOptions.find((option) => option.value === status)?.label ?? status;
}

function mapStatusVariant(status: string) {
  switch (status) {
    case "finalizado":
    case "published":
      return "success";
    case "em_producao":
      return "info";
    case "cancelado":
      return "danger";
    case "aguardando":
    case "draft":
    default:
      return "neutral";
  }
}

function getClientLabel(simulation: Awaited<ReturnType<typeof getAdminSimulationById>> & {}) {
  return simulation?.client?.trade_name || simulation?.client?.company_name || simulation?.client?.contact_name || "-";
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-rpx-ink">{value}</dd>
    </div>
  );
}

export default async function EditSimulationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [simulation, options, uploads] = await Promise.all([
    getAdminSimulationById(id),
    getAdminSimulationFormOptions(),
    listSimulationUploads(id, "simulation_result")
  ]);

  if (!simulation) {
    notFound();
  }

  const quote = simulation.quote;

  return (
    <>
      <PageHeader
        title="Detalhe da simulação"
        description="Consulte os dados vinculados, gerencie arquivos e atualize o status e observações."
        action={
          <ButtonLink href="/admin/simulacoes" variant="secondary" className="w-full sm:w-auto">
            Voltar
          </ButtonLink>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
        <div className="grid gap-6">
          <Card title="Resumo">
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="break-words text-xl font-bold text-rpx-ink">{simulation.title}</p>
                <p className="mt-2 text-sm text-slate-600">{getClientLabel(simulation)}</p>
              </div>
              <StatusBadge variant={mapStatusVariant(simulation.status)}>{mapStatus(simulation.status)}</StatusBadge>
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Criada em" value={formatDateTime(simulation.created_at)} />
              <DetailItem label="Solicitada em" value={formatDateTime(simulation.requested_at)} />
              <DetailItem label="Publicada em" value={formatDateTime(simulation.published_at)} />
              <DetailItem label="Cotação vinculada" value={simulation.quote_id ?? "Sem cotação vinculada"} />
              <DetailItem label="Arquivos" value={uploads.length > 0 ? `${uploads.length} enviado${uploads.length === 1 ? "" : "s"}` : "Pendente"} />
              <DetailItem label="Atualizada em" value={formatDateTime(simulation.updated_at)} />
            </dl>
          </Card>

          <Card
            title="Dados da cotação"
            description={
              quote
                ? "Informações herdadas da cotação vinculada."
                : "Esta simulação foi criada sem cotação vinculada; os dados ricos de produto e cálculo não ficam disponíveis nesta fase."
            }
          >
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Produto" value={quote?.product_name ?? "-"} />
              <DetailItem label="HS/NCM" value={quote?.hs_code ?? "-"} />
              <DetailItem label="Fornecedor" value={quote?.supplier_name ?? "-"} />
              <DetailItem label="E-mail fornecedor" value={quote?.supplier_email ?? "-"} />
              <DetailItem label="Telefone fornecedor" value={quote?.supplier_phone ?? "-"} />
              <DetailItem label="Quantidade" value={quote ? formatNumber(quote.quantity) : "-"} />
              <DetailItem label="FOB unitário" value={quote ? formatMoney(quote.fob_unit_usd, "USD") : "-"} />
              <DetailItem label="FOB total" value={quote ? formatMoney(quote.fob_total_usd, "USD") : "-"} />
              <DetailItem label="Total via RPX" value={quote ? formatMoney(quote.total_cost_rpx_brl) : "-"} />
              <DetailItem label="Importação direta" value={quote ? formatMoney(quote.total_cost_direct_brl) : "-"} />
              <DetailItem label="Economia estimada" value={quote ? formatMoney(quote.savings_brl) : "-"} />
              <DetailItem label="Economia %" value={quote ? formatPercent(quote.savings_percent) : "-"} />
            </dl>
          </Card>
        </div>

        <div className="grid gap-6">
          <SimulationFormCard
            action={updateAdminSimulationAction}
            title="Atualizar simulação"
            description="Edite apenas os campos administrativos permitidos nesta fase."
            submitLabel="Salvar alterações"
            cancelHref="/admin/simulacoes"
            clients={options.clients}
            quotes={options.quotes}
            values={{
              id: simulation.id,
              clientId: simulation.client_id,
              quoteId: simulation.quote_id ?? "",
              title: simulation.title,
              status: simulation.status,
              clientNotes: simulation.client_notes ?? ""
            }}
          />
          <UploadsCard
            simulationId={simulation.id}
            context="simulation_result"
            title="Arquivos da simulação"
            description="Envie arquivos de até 10MB."
            allowMultiple
            initialUploads={uploads}
          />
        </div>
      </div>
    </>
  );
}
