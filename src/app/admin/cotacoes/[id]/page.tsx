import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminQuoteById, type AdminQuoteDetail } from "@/lib/admin/queries";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UploadFilesCell } from "@/components/uploads/UploadFilesCell";
import { getUploadSignedUrl, listQuoteUploads, type UploadRecord } from "@/lib/uploads/actions";

function formatDateTime(value: string) {
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

function formatMoney(value: number, currency: "BRL" | "USD" = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency
  }).format(value ?? 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value ?? 0);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value ?? 0);
}

function formatDecimal(value: number, maximumFractionDigits = 4) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(value ?? 0);
}

function getClientLabel(quote: AdminQuoteDetail) {
  return quote.client?.trade_name || quote.client?.company_name || quote.client?.contact_name || "-";
}

function hasSimulation(quote: AdminQuoteDetail) {
  return quote.simulations.length > 0 || quote.status === "simulation_requested";
}

function getSituation(quote: AdminQuoteDetail) {
  return hasSimulation(quote) ? "Simulação solicitada" : "Recebida";
}

function getSituationVariant(quote: AdminQuoteDetail) {
  return hasSimulation(quote) ? "info" : "neutral";
}

function DetailItem({
  label,
  value
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-rpx-ink">{value || "-"}</dd>
    </div>
  );
}

function UploadGroup({
  title,
  uploads
}: {
  title: string;
  uploads: UploadRecord[];
}) {
  return (
    <Card title={title} description={uploads.length ? undefined : "Nenhum arquivo enviado."}>
      <div className="mt-4">
        <UploadFilesCell uploads={uploads} emptyLabel="Nenhum arquivo enviado." getSignedUrl={getUploadSignedUrl} />
      </div>
    </Card>
  );
}

export default async function AdminQuoteDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quote, productUploads, supplierUploads] = await Promise.all([
    getAdminQuoteById(id),
    listQuoteUploads(id, "quote_product_images"),
    listQuoteUploads(id, "quote_supplier_contact")
  ]);

  if (!quote) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Detalhe da cotação"
        description="Visão administrativa dos dados enviados pelo cliente pela calculadora."
        action={<ButtonLink href="/admin/cotacoes">Voltar</ButtonLink>}
      />
      <div className="grid gap-6">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Produto</p>
              <h2 className="mt-1 text-2xl font-bold text-rpx-ink">{quote.product_name}</h2>
              <p className="mt-2 text-sm text-slate-600">
                Cliente: <span className="font-semibold text-rpx-ink">{getClientLabel(quote)}</span>
              </p>
            </div>
            <StatusBadge variant={getSituationVariant(quote)}>{getSituation(quote)}</StatusBadge>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="Produto e valores">
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="HS/NCM" value={quote.hs_code || "-"} />
              <DetailItem label="Quantidade" value={formatNumber(quote.quantity)} />
              <DetailItem label="FOB unitário" value={formatMoney(quote.fob_unit_usd, "USD")} />
              <DetailItem label="FOB total" value={formatMoney(quote.fob_total_usd, "USD")} />
              <DetailItem label="Dólar usado" value={formatMoney(quote.used_dollar)} />
              <DetailItem label="Fator de importação usado" value={formatDecimal(quote.rpx_factor)} />
              <DetailItem label="Custo unitário via RPX" value={formatMoney(quote.unit_cost_rpx_brl)} />
              <DetailItem label="Custo total via RPX" value={formatMoney(quote.total_cost_rpx_brl)} />
              <DetailItem label="Custo unitário importação direta" value={formatMoney(quote.unit_cost_direct_brl)} />
              <DetailItem label="Custo total importação direta" value={formatMoney(quote.total_cost_direct_brl)} />
              <DetailItem label="Economia estimada" value={formatMoney(quote.savings_brl)} />
              <DetailItem label="Economia estimada %" value={formatPercent(quote.savings_percent)} />
            </dl>
          </Card>

          <Card title="Cliente e fornecedor">
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Cliente" value={getClientLabel(quote)} />
              <DetailItem label="E-mail do cliente" value={quote.client?.contact_email || "-"} />
              <DetailItem label="Contato do cliente" value={quote.client?.contact_name || "-"} />
              <DetailItem label="Telefone do cliente" value={quote.client?.contact_phone || "-"} />
              <DetailItem label="Fornecedor" value={quote.supplier_name || "-"} />
              <DetailItem label="E-mail do fornecedor" value={quote.supplier_email || "-"} />
              <DetailItem label="Telefone do fornecedor" value={quote.supplier_phone || "-"} />
            </dl>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="Datas e vínculo">
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Criada em" value={formatDateTime(quote.created_at)} />
              <DetailItem label="Atualizada em" value={formatDateTime(quote.updated_at)} />
              <DetailItem label="Status interno" value={quote.status || "-"} />
              <DetailItem label="Simulações vinculadas" value={formatNumber(quote.simulations.length)} />
            </dl>
          </Card>

          <Card title="Simulação vinculada" description={quote.simulations.length ? undefined : "Nenhuma simulação vinculada até o momento."}>
            {quote.simulations.length ? (
              <ul className="mt-4 grid gap-3">
                {quote.simulations.map((simulation) => (
                  <li key={simulation.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
                    <p className="font-semibold text-rpx-ink">{simulation.title}</p>
                    <p className="mt-1 text-slate-600">Status: {simulation.status}</p>
                    {simulation.quote_file_url || simulation.storage_path ? (
                      <p className="mt-1">
                        <Link
                          href={simulation.quote_file_url || simulation.storage_path || "#"}
                          className="text-rpx-blue hover:text-rpx-navy"
                        >
                          Abrir arquivo vinculado
                        </Link>
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <UploadGroup title="Arquivos do produto" uploads={productUploads} />
          <UploadGroup title="Arquivos do fornecedor/contato" uploads={supplierUploads} />
        </div>

        <p className="text-sm text-slate-500">
          Estimativa preliminar sujeita à validação fiscal, logística e operacional.
        </p>
      </div>
    </>
  );
}
