type SnapshotMetadata = {
  generated_at?: string;
  source_simulation_id?: string;
  source_calculation_calculated_at?: string | null;
};

type InternalSnapshot = {
  metadata?: SnapshotMetadata & {
    snapshot_type?: string;
    snapshot_version?: number;
  };
  simulation?: Record<string, unknown>;
  client_report?: {
    header?: Record<string, unknown>;
    logistics?: Record<string, unknown>;
    products?: Array<Record<string, unknown>>;
    invoice_entry?: Record<string, unknown>;
    invoice_exit?: Record<string, unknown>;
    icms_base_composition?: Record<string, unknown>;
    observations?: Record<string, unknown>;
  };
  products?: Array<Record<string, unknown>>;
  expenses?: Array<Record<string, unknown>>;
  tax_lines?: Array<Record<string, unknown>>;
  fiscal_snapshots?: {
    entry?: Record<string, unknown>;
    exit?: Record<string, unknown>;
    taxRegime?: Record<string, unknown>;
  };
  calculation_snapshot?: Record<string, unknown>;
  warnings?: string[];
  limitations?: string[];
  pending_fields?: Record<string, Array<Record<string, unknown>>>;
};

const pageWidth = 842;
const pageHeight = 595;
const margin = 34;
const bottomMargin = 34;
const contentWidth = pageWidth - margin * 2;

function hasObjectContent(value: unknown) {
  return Boolean(value && typeof value === "object" && Object.keys(value).length > 0);
}

export function isUsableFinalSimulationInternalSnapshot(value: unknown): value is InternalSnapshot {
  if (!hasObjectContent(value)) return false;
  const snapshot = value as InternalSnapshot;
  return snapshot.metadata?.snapshot_type === "internal_report" && Boolean(snapshot.metadata.source_calculation_calculated_at);
}

function stripToPdfText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdfText(value: string) {
  return stripToPdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function asString(value: unknown, fallback = "N/A") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "Sim" : "Nao";
  return fallback;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function formatDate(value?: unknown) {
  if (typeof value !== "string" || !value) return "N/A";
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function formatDateTime(value?: unknown) {
  if (typeof value !== "string" || !value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function formatNumber(value?: unknown, options: Intl.NumberFormatOptions = {}) {
  const number = asNumber(value);
  if (number === null) return "N/A";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(number);
}

function formatMoney(value?: unknown, currency = "BRL") {
  const number = asNumber(value);
  if (number === null) return "N/A";
  return `${currency} ${formatNumber(number)}`;
}

function readTotals(snapshot: InternalSnapshot) {
  const calculation = asRecord(snapshot.calculation_snapshot);
  return asRecord(calculation.totals);
}

function getIdentifier(snapshot: InternalSnapshot, simulationId: string) {
  const header = asRecord(snapshot.client_report?.header);
  return asString(header.identifier, simulationId.slice(0, 8));
}

class InternalReportPdf {
  private pages: string[][] = [[]];
  private y = pageHeight - margin;
  private pageNumber = 1;

  private current() {
    return this.pages[this.pages.length - 1];
  }

  private ensureSpace(height: number) {
    if (this.y - height < bottomMargin) {
      this.addPage();
    }
  }

  private addPage() {
    this.pages.push([]);
    this.pageNumber += 1;
    this.y = pageHeight - margin;
    this.text(margin, this.y, `Relatorio interno - pagina ${this.pageNumber}`, 9, true);
    this.y -= 18;
  }

  private line(x1: number, y1: number, x2: number, y2: number) {
    this.current().push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  private rect(x: number, y: number, width: number, height: number) {
    this.current().push(`${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S`);
  }

  private text(x: number, y: number, value: string, size = 8, bold = false) {
    this.current().push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapePdfText(value)}) Tj ET`);
  }

  private wrap(value: string, maxChars: number) {
    const words = stripToPdfText(value).split(" ").filter(Boolean);
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxChars && current) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }

    if (current) lines.push(current);
    return lines.length > 0 ? lines : ["N/A"];
  }

  private short(value: string, maxChars: number) {
    const text = stripToPdfText(value);
    return text.length > maxChars ? `${text.slice(0, Math.max(0, maxChars - 3))}...` : text;
  }

  paragraph(value: string, x: number, width: number, size = 8) {
    const maxChars = Math.max(20, Math.floor(width / (size * 0.55)));
    for (const line of this.wrap(value, maxChars)) {
      this.ensureSpace(size + 7);
      this.text(x, this.y, line, size);
      this.y -= size + 4;
    }
  }

  title(title: string, subtitle: string) {
    this.text(margin, this.y, title, 18, true);
    this.text(pageWidth - margin - 70, this.y, "Global RPX", 12, true);
    this.y -= 18;
    this.text(margin, this.y, subtitle, 9);
    this.y -= 16;
    this.line(margin, this.y, pageWidth - margin, this.y);
    this.y -= 16;
  }

  section(title: string, description?: string) {
    this.ensureSpace(38);
    this.text(margin, this.y, title.toUpperCase(), 10.5, true);
    this.y -= 12;
    if (description) {
      this.paragraph(description, margin, contentWidth, 7.5);
      this.y -= 2;
    }
  }

  keyValues(items: Array<[string, string]>, columns = 4) {
    const colWidth = contentWidth / columns;
    const rowHeight = 28;

    for (let index = 0; index < items.length; index += columns) {
      this.ensureSpace(rowHeight + 4);
      const row = items.slice(index, index + columns);
      row.forEach(([label, value], col) => {
        const x = margin + col * colWidth;
        this.text(x, this.y, label.toUpperCase(), 6.3, true);
        this.text(x, this.y - 12, this.short(value || "N/A", Math.floor(colWidth / 4.2)), 7.4);
      });
      this.y -= rowHeight;
    }
  }

  table(headers: string[], rows: string[][], widths: number[]) {
    const rowHeight = 22;
    const drawRow = (values: string[], y: number, bold = false) => {
      let x = margin;
      values.forEach((value, index) => {
        const maxChars = Math.max(8, Math.floor(widths[index] / 4.1));
        this.text(x + 3, y, this.short(value, maxChars), bold ? 6.5 : 6.2, bold);
        x += widths[index];
      });
    };

    this.ensureSpace(rowHeight * 2);
    this.rect(margin, this.y - 14, contentWidth, 19);
    drawRow(headers, this.y - 2, true);
    this.y -= 22;

    if (rows.length === 0) {
      this.ensureSpace(rowHeight);
      this.text(margin + 3, this.y, "Nenhum registro no snapshot interno.", 7);
      this.y -= rowHeight;
      return;
    }

    for (const row of rows) {
      this.ensureSpace(rowHeight);
      this.line(margin, this.y + 6, pageWidth - margin, this.y + 6);
      drawRow(row, this.y, false);
      this.y -= rowHeight;
    }
  }

  bullets(items: string[]) {
    if (items.length === 0) {
      this.paragraph("- N/A", margin, contentWidth, 8);
      return;
    }

    for (const item of items) {
      this.paragraph(`- ${item}`, margin, contentWidth, 8);
    }
  }

  build() {
    const objects: string[] = [];
    const pageObjectIds: number[] = [];
    const contentObjectIds: number[] = [];

    objects.push("<< /Type /Catalog /Pages 2 0 R >>");
    objects.push("");
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

    for (const ops of this.pages) {
      const content = ["0.12 w", "0 0 0 rg", ...ops].join("\n");
      const contentId = objects.length + 1;
      contentObjectIds.push(contentId);
      objects.push(`<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream`);

      const pageId = objects.length + 1;
      pageObjectIds.push(pageId);
      objects.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`
      );
    }

    objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

    const chunks = ["%PDF-1.4\n"];
    const offsets = [0];

    objects.forEach((object, index) => {
      offsets.push(Buffer.byteLength(chunks.join(""), "ascii"));
      chunks.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
    });

    const xrefOffset = Buffer.byteLength(chunks.join(""), "ascii");
    chunks.push(`xref\n0 ${objects.length + 1}\n`);
    chunks.push("0000000000 65535 f \n");
    offsets.slice(1).forEach((offset) => {
      chunks.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
    });
    chunks.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

    return new Uint8Array(Buffer.from(chunks.join(""), "ascii"));
  }
}

function taxTotalsText(totals: Record<string, unknown>, key: string) {
  return formatMoney(totals[key]);
}

function fiscalSnapshotRows(snapshot?: Record<string, unknown>) {
  const value = asRecord(snapshot);
  return [
    ["Codigo", asString(value.code)],
    ["Descricao", asString(value.description)],
    ["CFOP", asString(value.cfop)],
    ["Regime", asString(value.tax_regime)],
    ["ICMS", `${formatNumber(value.icms_rate)}%`]
  ] as Array<[string, string]>;
}

export function buildFinalSimulationInternalReportPdf(snapshot: InternalSnapshot, simulationId: string) {
  const pdf = new InternalReportPdf();
  const simulation = asRecord(snapshot.simulation);
  const header = asRecord(snapshot.client_report?.header);
  const logistics = asRecord(snapshot.client_report?.logistics);
  const totals = readTotals(snapshot);
  const identifier = getIdentifier(snapshot, simulationId);
  const products = snapshot.products ?? snapshot.client_report?.products ?? [];
  const expenses = snapshot.expenses ?? [];
  const taxLines = snapshot.tax_lines ?? [];
  const fiscal = snapshot.fiscal_snapshots ?? {};
  const pendingFields = snapshot.pending_fields ?? {};

  pdf.title("Relatorio interno da simulacao", `Documento interno gerado a partir do internal_snapshot - ${identifier}`);

  pdf.section("Cabecalho");
  pdf.keyValues([
    ["Codigo/numero", identifier],
    ["Simulation ID", simulationId],
    ["Cliente", asString(header.customerName ?? simulation.customer_name)],
    ["Data", formatDate(header.date ?? simulation.quote_date)],
    ["Validade", formatDate(header.validUntil ?? simulation.valid_until)],
    ["Status", asString(header.status ?? simulation.status)],
    ["Gerado em", formatDateTime(snapshot.metadata?.generated_at)],
    ["Calculo salvo", formatDateTime(snapshot.metadata?.source_calculation_calculated_at)]
  ], 4);

  pdf.section("Dados principais");
  pdf.keyValues([
    ["Modalidade", asString(logistics.modality ?? simulation.import_modality)],
    ["Transporte", asString(logistics.transportMode ?? simulation.transport_mode)],
    ["Origem", asString(logistics.origin ?? simulation.origin)],
    ["Destino", asString(logistics.destination ?? simulation.destination)],
    ["Incoterm", asString(logistics.incoterm ?? simulation.incoterm)],
    ["Moeda", asString(header.currency ?? simulation.currency)],
    ["Cambio", formatNumber(header.exchangeRate ?? simulation.exchange_rate, { maximumFractionDigits: 6 })],
    ["Fornecedor", asString(simulation.supplier_name)]
  ], 4);

  pdf.section("Produtos");
  pdf.table(
    ["Produto", "NCM", "Qtd", "Unit USD", "FOB USD", "FOB BRL", "PL/PB", "II", "IPI", "PIS", "COFINS", "ICMS"],
    products.map((product) => [
      asString(product.description ?? product.product_description),
      asString(product.ncm),
      formatNumber(product.quantity, { maximumFractionDigits: 4 }),
      formatMoney(product.unitPriceUsd ?? product.unit_price, "USD"),
      formatMoney(product.fobUsd ?? product.fob_total, "USD"),
      formatMoney(product.fobBrl),
      `${formatNumber(product.total_net_weight ?? product.netWeight)} / ${formatNumber(product.total_gross_weight ?? product.grossWeight)}`,
      `${formatNumber(product.iiRate ?? product.ii_rate)}%`,
      `${formatNumber(product.ipiRate ?? product.ipi_rate)}%`,
      `${formatNumber(product.pisRate ?? product.pis_rate)}%`,
      `${formatNumber(product.cofinsRate ?? product.cofins_rate)}%`,
      `${formatNumber(product.icmsRate ?? product.icms_rate)}%`
    ]),
    [108, 54, 36, 58, 58, 58, 52, 42, 42, 42, 50, 42]
  );

  pdf.section("Despesas");
  pdf.table(
    ["Descricao/tipo", "Valor BRL", "Origem", "Observacoes"],
    expenses.map((expense) => [
      asString(expense.expense_name ?? expense.description),
      formatMoney(expense.amount_brl),
      asString(expense.is_manual ? "Manual" : expense.is_from_preset ? "Pre-calculo" : "Nao informado"),
      asString(expense.notes ?? expense.description)
    ]),
    [220, 80, 90, 360]
  );

  pdf.section("Linhas fiscais");
  pdf.table(
    ["Produto", "Imposto", "Base BRL", "Aliq.", "Valor BRL", "Manual", "Formula/snapshot"],
    taxLines.map((line) => [
      asString(line.product_description ?? line.item_id),
      asString(line.tax_type),
      formatMoney(line.base_amount_brl),
      `${formatNumber(line.rate_percent)}%`,
      formatMoney(line.amount_brl),
      asString(line.is_manual_adjustment),
      asString(asRecord(line.formula_snapshot).calculation ?? line.manual_adjustment_reason)
    ]),
    [150, 76, 80, 50, 80, 48, 290]
  );

  pdf.section("Parametrizacao fiscal");
  pdf.keyValues(fiscalSnapshotRows(fiscal.entry), 5);
  pdf.keyValues(fiscalSnapshotRows(fiscal.exit), 5);
  pdf.keyValues([
    ["Credito IPI", asString(simulation.credits_ipi)],
    ["Credito PIS", asString(simulation.credits_pis)],
    ["Credito COFINS", asString(simulation.credits_cofins)],
    ["Credito ICMS", asString(simulation.credits_icms)],
    ["Comissao modo", asString(simulation.trade_commission_mode)],
    ["Comissao %", `${formatNumber(simulation.trade_commission_percent, { maximumFractionDigits: 4 })}%`],
    ["Comissao fixa", formatMoney(simulation.trade_commission_amount_brl)],
    ["Notas", asString(simulation.tax_credit_notes)]
  ], 4);

  pdf.section("Totais e calculo V1");
  pdf.keyValues([
    ["Customs/base", formatMoney(simulation.customs_value_brl ?? totals.total_customs_base_brl)],
    ["Total impostos", formatMoney(simulation.total_taxes_brl ?? totals.net_taxes_brl)],
    ["Custo total", formatMoney(simulation.total_cost_brl ?? totals.estimated_total_cost_brl)],
    ["FOB BRL", taxTotalsText(totals, "total_fob_brl")],
    ["Despesas", taxTotalsText(totals, "total_expenses_brl")],
    ["Impostos brutos", taxTotalsText(totals, "gross_taxes_brl")],
    ["Creditos", taxTotalsText(totals, "tax_credits_brl")],
    ["Impostos liquidos", taxTotalsText(totals, "net_taxes_brl")],
    ["Comissao", taxTotalsText(totals, "trade_commission_brl")],
    ["Custo estimado", taxTotalsText(totals, "estimated_total_cost_brl")]
  ], 5);

  pdf.section("Warnings e limitacoes V1");
  pdf.bullets([...(snapshot.warnings ?? []), ...(snapshot.limitations ?? [])]);
  pdf.bullets([
    "Sem gross-up ICMS no motor V1.",
    "Despesas rateadas de forma simplificada na V1.",
    "Creditos tributarios nao viram linhas fiscais negativas.",
    "Excel detalhado ainda nao implementado."
  ]);

  pdf.section("Lacunas e pendencias");
  const pending = Object.entries(pendingFields).flatMap(([group, fields]) =>
    (fields ?? []).map((field) => `${group}: ${asString(field.label)} - ${asString(field.value)}${field.note ? ` (${asString(field.note)})` : ""}`)
  );
  pdf.bullets(pending);

  return pdf.build();
}

export function buildFinalSimulationInternalReportFilename(snapshot: InternalSnapshot, simulationId: string) {
  const identifier = getIdentifier(snapshot, simulationId).replace(/[^a-zA-Z0-9_-]/g, "-");
  return `relatorio-interno-${identifier || simulationId.slice(0, 8)}.pdf`;
}
