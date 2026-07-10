import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FinalSimulationClientPdfPanel } from "./FinalSimulationClientPdfPanel";
import { FinalSimulationDocumentSnapshotsPanel } from "./FinalSimulationDocumentSnapshotsPanel";
import type { ClientReportData, ClientReportProduct, ClientReportTaxTotals } from "./client-report-builder";

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  in_review: "Em revisão",
  needs_adjustment: "Ajuste necessário",
  approved: "Aprovada",
  sent_to_customer: "Enviada ao cliente",
  archived: "Arquivada"
};

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

function formatDate(value: string | null) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string | null) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatNumber(value: number | null | undefined, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits
  }).format(value ?? 0);
}

function formatMoney(value: number | null | undefined, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2
  }).format(value ?? 0);
}

function LabelValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-2 border-b border-slate-200 py-1.5 text-sm">
      <dt className="font-bold text-rpx-ink">{label}</dt>
      <dd className="min-w-0 text-slate-700">{value}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border border-slate-900 bg-slate-100 px-3 py-1.5 text-center text-sm font-bold uppercase text-rpx-ink">
      {children}
    </h2>
  );
}

function TaxRows({ taxes }: { taxes: ClientReportTaxTotals }) {
  return (
    <>
      <LabelValue label="II" value={formatMoney(taxes.ii)} />
      <LabelValue label="IPI" value={formatMoney(taxes.ipi)} />
      <LabelValue label="PIS" value={formatMoney(taxes.pis)} />
      <LabelValue label="COFINS" value={formatMoney(taxes.cofins)} />
      <LabelValue label="ICMS" value={formatMoney(taxes.icms)} />
    </>
  );
}

function ProductRow({ product }: { product: ClientReportProduct }) {
  return (
    <tr className="border-b border-slate-300">
      <td className="px-2 py-2 font-mono text-xs">{product.ncm || "N/A"}</td>
      <td className="min-w-40 px-2 py-2 font-semibold">{product.description}</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatNumber(product.quantity, 6)}</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatMoney(product.unitPriceUsd, "USD")}</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatMoney(product.cifBrl)}</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatNumber(product.iiRate, 4)}%</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatMoney(product.taxes.ii)}</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatNumber(product.ipiRate, 4)}%</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatMoney(product.taxes.ipi)}</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatNumber(product.pisRate, 4)}%</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatMoney(product.taxes.pis)}</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatNumber(product.cofinsRate, 4)}%</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatMoney(product.taxes.cofins)}</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatMoney(product.allocatedExpensesBrl)}</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatMoney(product.taxes.icms)}</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatMoney(product.unitCostWithoutTaxesBrl)}</td>
      <td className="px-2 py-2 text-right tabular-nums">{formatMoney(product.unitCostWithTaxesBrl)}</td>
    </tr>
  );
}

export function FinalSimulationClientPreview({ report }: { report: ClientReportData }) {
  return (
    <div className="grid gap-5">
      <FinalSimulationDocumentSnapshotsPanel
        simulationId={report.simulation.id}
        hasSavedCalculation={report.meta.hasSavedCalculation}
        publicSnapshotGeneratedAt={report.meta.publicSnapshotGeneratedAt}
        internalSnapshotGeneratedAt={report.meta.internalSnapshotGeneratedAt}
      />
      <FinalSimulationClientPdfPanel simulationId={report.simulation.id} />

      <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold">Preview HTML para validação. Ainda não é o PDF final.</p>
          {!report.meta.hasSavedCalculation ? (
            <p className="mt-1">Recalcule os impostos antes de validar o preview do cliente.</p>
          ) : (
            <p className="mt-1">Cálculo salvo em {formatDateTime(report.meta.calculatedAt)}.</p>
          )}
        </div>
        <ButtonLink href={`/admin/simulacoes-finais/${report.simulation.id}`} variant="secondary">
          Voltar para simulação
        </ButtonLink>
      </div>

      <article className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-soft">
        <div className="grid gap-4 border-b-2 border-slate-900 p-5 lg:grid-cols-[220px_minmax(0,1fr)_260px] lg:items-start">
          <div className="relative h-20 w-44">
            <Image src="/logo-global-rpx-horizontal.png" alt="Global RPX" fill className="object-contain object-left" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-rpx-ink">{report.header.title}</h1>
            <p className="mt-2 text-lg font-bold text-rpx-ink">Número: {report.header.identifier}</p>
          </div>
          <dl className="rounded-md border border-slate-900 p-3 text-sm">
            <LabelValue label="Data" value={formatDate(report.header.date)} />
            <LabelValue label="Página" value="1/1" />
            <LabelValue label="Status" value={<StatusBadge variant={mapStatusVariant(report.header.status)}>{statusLabels[report.header.status] ?? report.header.status}</StatusBadge>} />
          </dl>
        </div>

        <section className="grid gap-3 border-b border-slate-900 p-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <dl>
            <LabelValue label="Cliente" value={report.header.customerName || "N/A"} />
            <LabelValue label="Origem" value={report.logistics.origin || "N/A"} />
            <LabelValue label="Destino" value={report.logistics.destination || "N/A"} />
            <LabelValue label="Incoterm" value={report.logistics.incoterm || "N/A"} />
            <LabelValue label="Modal" value={report.logistics.transportMode || "N/A"} />
            <LabelValue label="Validade" value={formatDate(report.header.validUntil)} />
          </dl>
          <dl>
            <LabelValue label="Moeda" value={report.header.currency} />
            <LabelValue label="Taxa" value={formatNumber(report.header.exchangeRate, 6)} />
            <LabelValue label="Frete USD" value={formatMoney(report.logistics.internationalFreightUsd, "USD")} />
            <LabelValue label="Seguro USD" value={formatMoney(report.logistics.internationalInsuranceUsd, "USD")} />
            <LabelValue label="Frete nacional" value={formatMoney(report.logistics.nationalFreightBrl)} />
          </dl>
          <dl className="lg:col-span-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {report.logistics.pendingFields.map((field) => (
              <div key={field.label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <dt className="text-xs font-bold uppercase text-slate-500">{field.label}</dt>
                <dd className="mt-1 font-semibold text-rpx-ink">{field.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-b border-slate-900 p-5">
          <SectionTitle>Tabela de produtos</SectionTitle>
          <div className="mt-3 overflow-x-auto rounded-md border border-slate-300">
            <table className="min-w-[1500px] w-full border-collapse text-xs">
              <thead className="bg-slate-100 text-rpx-ink">
                <tr className="[&>th]:border-b [&>th]:border-slate-300 [&>th]:px-2 [&>th]:py-2 [&>th]:text-left">
                  <th>NCM</th>
                  <th>Produto</th>
                  <th className="text-right">Quantidade</th>
                  <th className="text-right">Valor unitário USD</th>
                  <th className="text-right">FOB/CIF BRL</th>
                  <th className="text-right">Taxa II</th>
                  <th className="text-right">II</th>
                  <th className="text-right">Taxa IPI</th>
                  <th className="text-right">IPI</th>
                  <th className="text-right">Taxa PIS</th>
                  <th className="text-right">PIS</th>
                  <th className="text-right">Taxa COFINS</th>
                  <th className="text-right">COFINS</th>
                  <th className="text-right">Despesas</th>
                  <th className="text-right">ICMS</th>
                  <th className="text-right">Custo s/ impostos</th>
                  <th className="text-right">Custo c/ impostos</th>
                </tr>
              </thead>
              <tbody>
                {report.products.length > 0 ? (
                  report.products.map((product) => <ProductRow key={product.id} product={product} />)
                ) : (
                  <tr>
                    <td colSpan={17} className="px-3 py-8 text-center text-slate-500">
                      Nenhum produto cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 border-b border-slate-900 p-5 lg:grid-cols-3">
          <div>
            <SectionTitle>Composição base ICMS</SectionTitle>
            <dl className="mt-3">
              <LabelValue label="CIF/base" value={formatMoney(report.icmsBaseComposition.customsBaseBrl)} />
              <TaxRows taxes={report.icmsBaseComposition.taxes} />
              <LabelValue label="Despesas" value={formatMoney(report.icmsBaseComposition.expensesBrl)} />
              <LabelValue label="Base ICMS" value={formatMoney(report.icmsBaseComposition.icmsBaseBrl)} />
            </dl>
          </div>
          <div>
            <SectionTitle>Nota fiscal de entrada</SectionTitle>
            <dl className="mt-3">
              <LabelValue label="Produtos" value={formatMoney(report.invoiceEntry.productTotalBrl)} />
              <LabelValue label="Base aduaneira" value={formatMoney(report.invoiceEntry.customsBaseBrl)} />
              <TaxRows taxes={report.invoiceEntry.taxes} />
              <LabelValue label="Despesas" value={formatMoney(report.invoiceEntry.expensesBrl)} />
              <LabelValue label="Total estimado" value={formatMoney(report.invoiceEntry.estimatedTotalBrl)} />
            </dl>
          </div>
          <div>
            <SectionTitle>Nota fiscal de saída</SectionTitle>
            <dl className="mt-3">
              <LabelValue label="Produtos" value={formatMoney(report.invoiceExit.productTotalBrl)} />
              <LabelValue label="Base ICMS" value={formatMoney(report.invoiceExit.icmsBaseBrl)} />
              <LabelValue label="ICMS" value={formatMoney(report.invoiceExit.icmsBrl)} />
              <LabelValue label="Comissão" value={formatMoney(report.invoiceExit.tradeCommissionBrl)} />
              <LabelValue label="Total estimado" value={formatMoney(report.invoiceExit.estimatedTotalBrl)} />
              {report.invoiceExit.pendingFields.map((field) => (
                <LabelValue key={field.label} label={field.label} value={field.value} />
              ))}
            </dl>
          </div>
        </section>

        <section className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <SectionTitle>Observações</SectionTitle>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {report.observations.disclaimers.map((disclaimer) => (
                <li key={disclaimer}>{disclaimer}</li>
              ))}
              {report.observations.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-slate-900 p-3">
            <p className="text-xs font-bold uppercase text-slate-500">Resumo</p>
            <p className="mt-2 bg-yellow-200 px-2 py-1 text-lg font-bold text-rpx-ink">
              Desembolso total: {formatMoney(report.invoiceExit.estimatedTotalBrl)}
            </p>
            <p className="mt-2 text-sm text-slate-700">Linhas fiscais salvas: {report.meta.taxLinesCount}</p>
            <p className="text-sm text-slate-700">Despesas cadastradas: {report.meta.expensesCount}</p>
          </div>
        </section>
      </article>
    </div>
  );
}
