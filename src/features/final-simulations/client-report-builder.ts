import {
  getFinalSimulationById,
  getFinalSimulationItems,
  getSimulationExpenseLines,
  getSimulationTaxLines
} from "./queries";
import type {
  FinalSimulationItemRow,
  FinalSimulationRow,
  SimulationExpenseLine,
  SimulationTaxLineWithProduct
} from "./types";

export type ClientReportPendingField = {
  label: string;
  value: string;
  note?: string;
};

export type ClientReportTaxTotals = {
  ii: number;
  ipi: number;
  pis: number;
  cofins: number;
  icms: number;
};

export type ClientReportProduct = {
  id: string;
  ncm: string;
  description: string;
  quantity: number;
  unitPriceUsd: number;
  fobUsd: number;
  fobBrl: number;
  cifBrl: number;
  iiRate: number;
  ipiRate: number;
  pisRate: number;
  cofinsRate: number;
  icmsRate: number;
  taxes: ClientReportTaxTotals;
  allocatedExpensesBrl: number;
  unitCostWithoutTaxesBrl: number;
  unitCostWithTaxesBrl: number;
};

export type ClientReportData = {
  simulation: FinalSimulationRow;
  header: {
    title: string;
    identifier: string;
    date: string | null;
    validUntil: string | null;
    customerName: string | null;
    currency: string;
    exchangeRate: number;
    status: string;
  };
  logistics: {
    modality: string | null;
    transportMode: string | null;
    incoterm: string | null;
    origin: string | null;
    destination: string | null;
    internationalFreightUsd: number;
    internationalInsuranceUsd: number;
    nationalFreightBrl: number;
    pendingFields: ClientReportPendingField[];
  };
  products: ClientReportProduct[];
  invoiceEntry: {
    productTotalBrl: number;
    customsBaseBrl: number;
    expensesBrl: number;
    taxes: ClientReportTaxTotals;
    estimatedTotalBrl: number;
    pendingFields: ClientReportPendingField[];
  };
  invoiceExit: {
    productTotalBrl: number;
    icmsBaseBrl: number;
    icmsBrl: number;
    tradeCommissionBrl: number;
    estimatedTotalBrl: number;
    pendingFields: ClientReportPendingField[];
  };
  icmsBaseComposition: {
    customsBaseBrl: number;
    expensesBrl: number;
    taxes: ClientReportTaxTotals;
    icmsBaseBrl: number;
    icmsBrl: number;
  };
  observations: {
    disclaimers: string[];
    warnings: string[];
  };
  meta: {
    hasSavedCalculation: boolean;
    calculatedAt: string | null;
    taxLinesCount: number;
    expensesCount: number;
  };
};

type SavedCalculationSnapshot = {
  scope?: string;
  calculated_at?: string;
  totals?: Partial<Record<string, number>>;
  warnings?: Array<{ message?: string }>;
};

const notAvailable = "N/A";

function isSavedCalculationSnapshot(value: Record<string, unknown>): value is SavedCalculationSnapshot {
  return Boolean(value.scope === "tax_recalculation" && value.totals && typeof value.totals === "object");
}

function readSnapshotTotal(snapshot: SavedCalculationSnapshot | null, key: string) {
  const value = snapshot?.totals?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function sumTaxLines(taxLines: SimulationTaxLineWithProduct[], itemId?: string | null): ClientReportTaxTotals {
  const filteredLines = itemId ? taxLines.filter((line) => line.item_id === itemId) : taxLines;

  return filteredLines.reduce<ClientReportTaxTotals>(
    (totals, line) => {
      if (line.tax_type === "II") totals.ii += line.amount_brl;
      if (line.tax_type === "IPI") totals.ipi += line.amount_brl;
      if (line.tax_type === "PIS_IMPORTACAO") totals.pis += line.amount_brl;
      if (line.tax_type === "COFINS_IMPORTACAO") totals.cofins += line.amount_brl;
      if (line.tax_type === "ICMS") totals.icms += line.amount_brl;
      return totals;
    },
    { ii: 0, ipi: 0, pis: 0, cofins: 0, icms: 0 }
  );
}

function buildIdentifier(simulation: FinalSimulationRow) {
  if (simulation.code) {
    return simulation.code;
  }

  return simulation.number ? String(simulation.number) : simulation.id.slice(0, 8);
}

function buildContainerValue(simulation: FinalSimulationRow) {
  const parts = [
    simulation.container_20_qty > 0 ? `${simulation.container_20_qty}x20` : "",
    simulation.container_40_qty > 0 ? `${simulation.container_40_qty}x40` : "",
    simulation.container_lcl_qty > 0 ? `${simulation.container_lcl_qty} LCL` : "",
    simulation.container_other_qty > 0 ? `${simulation.container_other_qty} outros` : ""
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : notAvailable;
}

function buildPendingFields(simulation: FinalSimulationRow): ClientReportPendingField[] {
  return [
    { label: "Terminal", value: notAvailable, note: "Campo ainda não estruturado." },
    { label: "Container", value: buildContainerValue(simulation), note: "Formato final pendente de validação." },
    { label: "Carga IMO", value: notAvailable, note: "Campo ainda não estruturado." },
    { label: "LI", value: simulation.requires_import_license ? "Sim" : "Não", note: "Hoje existe apenas flag simples." },
    { label: "Embalagem", value: simulation.packaging || notAvailable }
  ];
}

function buildProducts(
  items: FinalSimulationItemRow[],
  taxLines: SimulationTaxLineWithProduct[],
  exchangeRate: number
): ClientReportProduct[] {
  return items.map((item) => {
    const fobUsd = item.total_price || item.quantity * item.unit_price;
    const fobBrl = fobUsd * exchangeRate;

    return {
      id: item.id,
      ncm: item.ncm,
      description: item.product_description || item.product_name || "Produto sem descrição",
      quantity: item.quantity,
      unitPriceUsd: item.unit_price,
      fobUsd,
      fobBrl,
      cifBrl: item.cif_total || fobBrl,
      iiRate: item.ii_rate,
      ipiRate: item.ipi_rate,
      pisRate: item.pis_rate,
      cofinsRate: item.cofins_rate,
      icmsRate: item.icms_rate,
      taxes: sumTaxLines(taxLines, item.id),
      allocatedExpensesBrl: item.allocated_expenses_total,
      unitCostWithoutTaxesBrl: item.unit_cost_without_taxes_brl,
      unitCostWithTaxesBrl: item.unit_cost_with_taxes_brl
    };
  });
}

function buildWarnings(snapshot: SavedCalculationSnapshot | null) {
  return (snapshot?.warnings ?? []).map((warning) => warning.message).filter(Boolean) as string[];
}

function sumExpenses(expenses: SimulationExpenseLine[], fallback: number) {
  if (expenses.length === 0) {
    return fallback;
  }

  return expenses.reduce((total, expense) => total + Number(expense.amount_brl ?? 0), 0);
}

export async function buildFinalSimulationClientReportData(simulationId: string): Promise<ClientReportData | null> {
  const [simulation, items, expenses, taxLines] = await Promise.all([
    getFinalSimulationById(simulationId),
    getFinalSimulationItems(simulationId),
    getSimulationExpenseLines(simulationId),
    getSimulationTaxLines(simulationId)
  ]);

  if (!simulation) {
    return null;
  }

  const savedSnapshot = isSavedCalculationSnapshot(simulation.calculation_snapshot)
    ? simulation.calculation_snapshot
    : null;
  const hasSavedCalculation = Boolean(savedSnapshot && taxLines.length > 0);
  const expensesBrl = sumExpenses(expenses, simulation.total_expenses_brl);
  const allTaxTotals = sumTaxLines(taxLines);
  const productTotalBrl = readSnapshotTotal(savedSnapshot, "total_fob_brl") || simulation.total_products_usd * simulation.exchange_rate;
  const customsBaseBrl = readSnapshotTotal(savedSnapshot, "total_customs_base_brl") || simulation.customs_value_brl;
  const estimatedTotalBrl = readSnapshotTotal(savedSnapshot, "estimated_total_cost_brl") || simulation.total_cost_brl;
  const tradeCommissionBrl = readSnapshotTotal(savedSnapshot, "trade_commission_brl") || simulation.trade_commission_amount_brl;
  const icmsBaseBrl = taxLines.find((line) => line.tax_type === "ICMS")?.base_amount_brl ?? customsBaseBrl;

  return {
    simulation,
    header: {
      title: "Simulação de importação",
      identifier: buildIdentifier(simulation),
      date: simulation.quote_date,
      validUntil: simulation.valid_until,
      customerName: simulation.customer_name,
      currency: simulation.currency ?? "USD",
      exchangeRate: simulation.exchange_rate,
      status: simulation.status
    },
    logistics: {
      modality: simulation.import_modality,
      transportMode: simulation.transport_mode,
      incoterm: simulation.incoterm,
      origin: simulation.origin,
      destination: simulation.destination,
      internationalFreightUsd: simulation.international_freight_usd,
      internationalInsuranceUsd: simulation.international_insurance_usd,
      nationalFreightBrl: simulation.national_freight_brl,
      pendingFields: buildPendingFields(simulation)
    },
    products: buildProducts(items, taxLines, simulation.exchange_rate),
    invoiceEntry: {
      productTotalBrl,
      customsBaseBrl,
      expensesBrl,
      taxes: allTaxTotals,
      estimatedTotalBrl,
      pendingFields: [
        { label: "Valor total das notas fiscais", value: hasSavedCalculation ? "Derivado do cálculo salvo" : notAvailable },
        { label: "CFOP/Natureza", value: notAvailable, note: "Snapshot fiscal existe, mas exposição no PDF ainda será validada." }
      ]
    },
    invoiceExit: {
      productTotalBrl: estimatedTotalBrl,
      icmsBaseBrl,
      icmsBrl: allTaxTotals.icms,
      tradeCommissionBrl,
      estimatedTotalBrl,
      pendingFields: [
        { label: "Crédito presumido", value: notAvailable },
        { label: "ICMS ST", value: notAvailable },
        { label: "Honorários", value: notAvailable },
        { label: "Revisão", value: notAvailable }
      ]
    },
    icmsBaseComposition: {
      customsBaseBrl,
      expensesBrl,
      taxes: allTaxTotals,
      icmsBaseBrl,
      icmsBrl: allTaxTotals.icms
    },
    observations: {
      disclaimers: [
        "Valores sujeitos à variação cambial.",
        "Valores sujeitos a mudanças na legislação.",
        "Simulação estimativa, sujeita à validação operacional e fiscal."
      ],
      warnings: buildWarnings(savedSnapshot)
    },
    meta: {
      hasSavedCalculation,
      calculatedAt: savedSnapshot?.calculated_at ?? null,
      taxLinesCount: taxLines.length,
      expensesCount: expenses.length
    }
  };
}
