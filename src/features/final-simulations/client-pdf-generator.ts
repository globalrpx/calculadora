type SnapshotMetadata = {
  snapshot_version?: number;
  snapshot_type?: string;
  generated_at?: string;
  source_simulation_id?: string;
  source_calculation_calculated_at?: string | null;
};

type SnapshotPendingField = {
  label?: string;
  value?: string;
  note?: string;
};

type SnapshotTaxTotals = {
  ii?: number;
  ipi?: number;
  pis?: number;
  cofins?: number;
  icms?: number;
};

type SnapshotProduct = {
  ncm?: string;
  description?: string;
  quantity?: number;
  unitPriceUsd?: number;
  fobUsd?: number;
  fobBrl?: number;
  cifBrl?: number;
  iiRate?: number;
  ipiRate?: number;
  pisRate?: number;
  cofinsRate?: number;
  icmsRate?: number;
  unitCostWithoutTaxesBrl?: number;
  unitCostWithTaxesBrl?: number;
};

export type FinalSimulationPublicSnapshot = {
  metadata?: SnapshotMetadata;
  header?: {
    title?: string;
    identifier?: string;
    date?: string | null;
    validUntil?: string | null;
    customerName?: string | null;
    currency?: string | null;
    exchangeRate?: number;
    status?: string;
  };
  logistics?: {
    modality?: string | null;
    transportMode?: string | null;
    incoterm?: string | null;
    origin?: string | null;
    destination?: string | null;
    internationalFreightUsd?: number;
    internationalInsuranceUsd?: number;
    nationalFreightBrl?: number;
    pendingFields?: SnapshotPendingField[];
  };
  products?: SnapshotProduct[];
  invoice_entry?: {
    productTotalBrl?: number;
    customsBaseBrl?: number;
    expensesBrl?: number;
    taxes?: SnapshotTaxTotals;
    estimatedTotalBrl?: number;
    pendingFields?: SnapshotPendingField[];
  };
  invoice_exit?: {
    productTotalBrl?: number;
    icmsBaseBrl?: number;
    icmsBrl?: number;
    tradeCommissionBrl?: number;
    estimatedTotalBrl?: number;
    pendingFields?: SnapshotPendingField[];
  };
  icms_base_composition?: {
    customsBaseBrl?: number;
    expensesBrl?: number;
    taxes?: SnapshotTaxTotals;
    icmsBaseBrl?: number;
    icmsBrl?: number;
  };
  observations?: {
    disclaimers?: string[];
    warnings?: string[];
  };
  pending_fields?: Record<string, SnapshotPendingField[]>;
};

const pageWidth = 842;
const pageHeight = 595;
const margin = 34;
const bottomMargin = 34;
const contentWidth = pageWidth - margin * 2;

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

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function formatDateTime(value?: string | null) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function formatNumber(value?: number | null, options: Intl.NumberFormatOptions = {}) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(value);
}

function formatMoney(value?: number | null, currency = "BRL") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A";
  return `${currency} ${formatNumber(value)}`;
}

function getSnapshotIdentifier(snapshot: FinalSimulationPublicSnapshot, simulationId: string) {
  return snapshot.header?.identifier || simulationId.slice(0, 8);
}

function hasObjectContent(value: unknown) {
  return Boolean(value && typeof value === "object" && Object.keys(value).length > 0);
}

export function isUsableFinalSimulationPublicSnapshot(value: unknown): value is FinalSimulationPublicSnapshot {
  if (!hasObjectContent(value)) return false;
  const snapshot = value as FinalSimulationPublicSnapshot;
  return snapshot.metadata?.snapshot_type === "client_pdf" && Boolean(snapshot.metadata.source_calculation_calculated_at);
}

class SimplePdf {
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
    this.text(margin, this.y, `Simulacao de importacao - pagina ${this.pageNumber}`, 9, true);
    this.y -= 18;
  }

  private line(x1: number, y1: number, x2: number, y2: number) {
    this.current().push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  private rect(x: number, y: number, width: number, height: number, fill = false) {
    this.current().push(
      `${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re ${fill ? "f" : "S"}`
    );
  }

  private text(x: number, y: number, value: string, size = 9, bold = false) {
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

  paragraph(value: string, x: number, width: number, size = 9) {
    const maxChars = Math.max(18, Math.floor(width / (size * 0.52)));
    for (const line of this.wrap(value, maxChars)) {
      this.ensureSpace(size + 6);
      this.text(x, this.y, line, size);
      this.y -= size + 4;
    }
  }

  title(title: string, subtitle: string) {
    this.text(margin, this.y, title, 19, true);
    this.text(pageWidth - margin - 70, this.y, "Global RPX", 12, true);
    this.y -= 18;
    this.text(margin, this.y, subtitle, 9);
    this.y -= 16;
    this.line(margin, this.y, pageWidth - margin, this.y);
    this.y -= 16;
  }

  section(title: string, description?: string) {
    this.ensureSpace(42);
    this.text(margin, this.y, title.toUpperCase(), 11, true);
    this.y -= 13;
    if (description) {
      this.paragraph(description, margin, contentWidth, 8);
      this.y -= 3;
    }
  }

  keyValues(items: Array<[string, string]>, columns = 4) {
    const colWidth = contentWidth / columns;
    const rowHeight = 30;

    for (let index = 0; index < items.length; index += columns) {
      this.ensureSpace(rowHeight + 4);
      const row = items.slice(index, index + columns);
      row.forEach(([label, value], col) => {
        const x = margin + col * colWidth;
        this.text(x, this.y, label.toUpperCase(), 6.5, true);
        this.text(x, this.y - 12, value || "N/A", 8);
      });
      this.y -= rowHeight;
    }
  }

  table(headers: string[], rows: string[][], widths: number[]) {
    const rowHeight = 24;
    const drawRow = (values: string[], y: number, bold = false) => {
      let x = margin;
      values.forEach((value, index) => {
        this.text(x + 3, y, value, bold ? 7 : 6.8, bold);
        x += widths[index];
      });
    };

    this.ensureSpace(rowHeight * 2);
    this.rect(margin, this.y - 15, contentWidth, 20);
    drawRow(headers, this.y - 2, true);
    this.y -= 24;

    for (const row of rows) {
      this.ensureSpace(rowHeight);
      this.line(margin, this.y + 6, pageWidth - margin, this.y + 6);
      drawRow(row, this.y, false);
      this.y -= rowHeight;
    }

    if (rows.length === 0) {
      this.ensureSpace(rowHeight);
      this.text(margin + 3, this.y, "Nenhum item no snapshot publico.", 8);
      this.y -= rowHeight;
    }
  }

  bullets(items: string[]) {
    if (items.length === 0) {
      this.paragraph("N/A", margin, contentWidth, 8);
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

function pendingFieldsText(fields?: SnapshotPendingField[]) {
  return (fields ?? []).map((field) => `${field.label || "Campo"}: ${field.value || "N/A"}`);
}

export function buildFinalSimulationClientPdf(snapshot: FinalSimulationPublicSnapshot, simulationId: string) {
  const pdf = new SimplePdf();
  const header = snapshot.header ?? {};
  const logistics = snapshot.logistics ?? {};
  const entry = snapshot.invoice_entry ?? {};
  const exit = snapshot.invoice_exit ?? {};
  const icms = snapshot.icms_base_composition ?? {};
  const products = snapshot.products ?? [];
  const identifier = getSnapshotIdentifier(snapshot, simulationId);

  pdf.title("Simulacao de importacao", `Documento cliente gerado a partir do snapshot publico - ${identifier}`);
  pdf.keyValues([
    ["Numero", identifier],
    ["Data", formatDate(header.date)],
    ["Validade", formatDate(header.validUntil)],
    ["Cliente", header.customerName || "N/A"],
    ["Moeda", header.currency || "N/A"],
    ["Cambio", formatNumber(header.exchangeRate, { maximumFractionDigits: 6 })],
    ["Status", header.status || "N/A"],
    ["Snapshot", formatDateTime(snapshot.metadata?.generated_at)]
  ]);

  pdf.section("Dados comerciais e logisticos");
  pdf.keyValues([
    ["Modal", logistics.transportMode || "N/A"],
    ["Modalidade", logistics.modality || "N/A"],
    ["Incoterm", logistics.incoterm || "N/A"],
    ["Origem", logistics.origin || "N/A"],
    ["Destino", logistics.destination || "N/A"],
    ["Frete USD", formatMoney(logistics.internationalFreightUsd, "USD")],
    ["Seguro USD", formatMoney(logistics.internationalInsuranceUsd, "USD")],
    ["Frete nacional", formatMoney(logistics.nationalFreightBrl)]
  ]);
  pdf.bullets(pendingFieldsText(logistics.pendingFields));

  pdf.section("Produtos");
  pdf.table(
    ["NCM", "Produto", "Qtd", "Unit USD", "FOB BRL", "CIF/Base", "II", "IPI", "PIS", "COFINS", "ICMS", "Custo c/ imp."],
    products.map((product) => [
      product.ncm || "N/A",
      product.description || "N/A",
      formatNumber(product.quantity, { maximumFractionDigits: 4 }),
      formatMoney(product.unitPriceUsd, "USD"),
      formatMoney(product.fobBrl),
      formatMoney(product.cifBrl),
      `${formatNumber(product.iiRate)}%`,
      `${formatNumber(product.ipiRate)}%`,
      `${formatNumber(product.pisRate)}%`,
      `${formatNumber(product.cofinsRate)}%`,
      `${formatNumber(product.icmsRate)}%`,
      formatMoney(product.unitCostWithTaxesBrl)
    ]),
    [50, 120, 35, 58, 60, 60, 38, 38, 42, 48, 42, 84]
  );

  pdf.section("Nota fiscal de entrada aproximada");
  pdf.keyValues([
    ["Total produtos", formatMoney(entry.productTotalBrl)],
    ["CIF/Base aduaneira", formatMoney(entry.customsBaseBrl)],
    ["Despesas", formatMoney(entry.expensesBrl)],
    ["II", formatMoney(entry.taxes?.ii)],
    ["IPI", formatMoney(entry.taxes?.ipi)],
    ["PIS", formatMoney(entry.taxes?.pis)],
    ["COFINS", formatMoney(entry.taxes?.cofins)],
    ["ICMS", formatMoney(entry.taxes?.icms)],
    ["Total estimado", formatMoney(entry.estimatedTotalBrl)]
  ], 3);
  pdf.bullets(pendingFieldsText(entry.pendingFields));

  pdf.section("Nota fiscal de saida aproximada");
  pdf.keyValues([
    ["Total produtos", formatMoney(exit.productTotalBrl)],
    ["Base ICMS", formatMoney(exit.icmsBaseBrl)],
    ["ICMS", formatMoney(exit.icmsBrl)],
    ["Comissao trade", formatMoney(exit.tradeCommissionBrl)],
    ["Total estimado", formatMoney(exit.estimatedTotalBrl)]
  ], 3);
  pdf.bullets(pendingFieldsText(exit.pendingFields));

  pdf.section("Composicao da base ICMS");
  pdf.keyValues([
    ["Base/CIF", formatMoney(icms.customsBaseBrl)],
    ["II", formatMoney(icms.taxes?.ii)],
    ["IPI", formatMoney(icms.taxes?.ipi)],
    ["PIS", formatMoney(icms.taxes?.pis)],
    ["COFINS", formatMoney(icms.taxes?.cofins)],
    ["Despesas", formatMoney(icms.expensesBrl)],
    ["Base ICMS", formatMoney(icms.icmsBaseBrl)],
    ["ICMS", formatMoney(icms.icmsBrl)]
  ]);

  pdf.section("Observacoes");
  pdf.bullets(snapshot.observations?.disclaimers ?? []);
  pdf.bullets(snapshot.observations?.warnings ?? []);
  pdf.paragraph("Simulacao estimativa sujeita a validacao fiscal, logistica e operacional.", margin, contentWidth, 8);

  return pdf.build();
}

export function buildFinalSimulationClientPdfFilename(snapshot: FinalSimulationPublicSnapshot, simulationId: string) {
  const identifier = getSnapshotIdentifier(snapshot, simulationId).replace(/[^a-zA-Z0-9_-]/g, "-");
  return `simulacao-cliente-${identifier || simulationId.slice(0, 8)}.pdf`;
}
