import type { FinalSimulationItemRow, FinalSimulationItemValues, TradeCommissionMode } from "./types";

export type BasicItemCalculationInput = {
  quantity: number;
  unitPrice: number;
  unitNetWeight: number;
  unitGrossWeight: number;
};

export type BasicItemCalculationResult = {
  totalPrice: number;
  totalNetWeight: number;
  totalGrossWeight: number;
};

export type BasicSimulationTotals = {
  totalProductsUsd: number;
  netWeight: number;
  grossWeight: number;
};

export type SimulationExpensesTotalInput = {
  amount_brl: number | string | null;
};

export type FinalSimulationTaxPreviewItemInput = {
  itemId: string;
  description: string;
  ncm?: string | null;
  totalPriceUsd: number;
  iiRate: number;
  ipiRate: number;
  pisRate: number;
  cofinsRate: number;
  icmsRate: number;
};

export type FinalSimulationTaxPreviewInput = {
  simulationId?: string;
  exchangeRate: number;
  totalExpensesBrl: number;
  creditsIpi: boolean;
  creditsPis: boolean;
  creditsCofins: boolean;
  creditsIcms: boolean;
  tradeCommissionMode?: TradeCommissionMode | null;
  tradeCommissionPercent?: number | null;
  tradeCommissionAmountBrl?: number | null;
  ignoreTradeCommissionContract?: boolean;
  hasEntryInvoiceSnapshot?: boolean;
  hasExitInvoiceSnapshot?: boolean;
  items: FinalSimulationTaxPreviewItemInput[];
};

export type FinalSimulationTaxPreviewWarningCode =
  | "exchange_rate_invalid"
  | "missing_items"
  | "zero_total_fob"
  | "missing_ncm"
  | "zero_icms"
  | "missing_entry_invoice_snapshot"
  | "missing_exit_invoice_snapshot";

export type FinalSimulationTaxPreviewWarning = {
  code: FinalSimulationTaxPreviewWarningCode;
  message: string;
  itemId?: string;
};

export type FinalSimulationTaxPreviewItem = {
  item_id: string;
  description: string;
  fob_brl: number;
  expense_allocation_brl: number;
  customs_base_brl: number;
  ii_brl: number;
  ipi_brl: number;
  pis_brl: number;
  cofins_brl: number;
  icms_brl: number;
  gross_taxes_brl: number;
  tax_credits_brl: number;
  net_taxes_brl: number;
  estimated_total_cost_brl: number;
};

export type FinalSimulationTaxPreviewTotals = {
  total_fob_brl: number;
  total_expenses_brl: number;
  total_customs_base_brl: number;
  gross_taxes_brl: number;
  tax_credits_brl: number;
  net_taxes_brl: number;
  trade_commission_brl: number;
  estimated_total_cost_brl: number;
};

export type FinalSimulationTaxPreview = {
  totals: FinalSimulationTaxPreviewTotals;
  items: FinalSimulationTaxPreviewItem[];
  warnings: FinalSimulationTaxPreviewWarning[];
  meta: {
    trade_commission_mode: TradeCommissionMode | "none";
    ignore_trade_commission_contract: boolean;
  };
};

export function parseLocalizedNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (value == null) {
    return 0;
  }

  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim().replace(/\s+/g, "");

  if (!text) {
    return 0;
  }

  if (!/^-?[\d.,]+$/.test(text)) {
    return null;
  }

  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");
  let normalized = text;

  if (lastComma >= 0 && lastDot >= 0) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";
    normalized = text.split(thousandsSeparator).join("").replace(decimalSeparator, ".");
  } else if (lastComma >= 0) {
    normalized = text.replace(",", ".");
  } else if (lastDot >= 0) {
    const thousandsOnly = /^-?\d{1,3}(\.\d{3})+$/.test(text);
    normalized = thousandsOnly ? text.replace(/\./g, "") : text;
  }

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeNumber(value: unknown) {
  return parseLocalizedNumber(value) ?? 0;
}

export function isValidLocalizedNumber(value: unknown) {
  return parseLocalizedNumber(value) !== null;
}

function roundSix(value: number) {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateItemTotals(input: BasicItemCalculationInput): BasicItemCalculationResult {
  const quantity = normalizeNumber(input.quantity);
  const unitPrice = normalizeNumber(input.unitPrice);
  const unitNetWeight = normalizeNumber(input.unitNetWeight);
  const unitGrossWeight = normalizeNumber(input.unitGrossWeight);

  return {
    totalPrice: roundSix(quantity * unitPrice),
    totalNetWeight: roundSix(quantity * unitNetWeight),
    totalGrossWeight: roundSix(quantity * unitGrossWeight)
  };
}

export function calculateItemTotalsFromValues(values: FinalSimulationItemValues): BasicItemCalculationResult {
  return calculateItemTotals({
    quantity: values.quantity,
    unitPrice: values.unitPrice,
    unitNetWeight: values.unitNetWeight,
    unitGrossWeight: values.unitGrossWeight
  });
}

export function calculateSimulationBasicTotals(items: Array<Pick<FinalSimulationItemRow, "total_price" | "total_net_weight" | "total_gross_weight">>): BasicSimulationTotals {
  return items.reduce<BasicSimulationTotals>(
    (totals, item) => ({
      totalProductsUsd: roundSix(totals.totalProductsUsd + normalizeNumber(item.total_price)),
      netWeight: roundSix(totals.netWeight + normalizeNumber(item.total_net_weight)),
      grossWeight: roundSix(totals.grossWeight + normalizeNumber(item.total_gross_weight))
    }),
    {
      totalProductsUsd: 0,
      netWeight: 0,
      grossWeight: 0
    }
  );
}

export function calculateSimulationExpensesTotal(expenses: SimulationExpensesTotalInput[]) {
  return roundSix(expenses.reduce((total, expense) => total + normalizeNumber(expense.amount_brl), 0));
}

function calculateTaxCredits(input: {
  ipiBrl: number;
  pisBrl: number;
  cofinsBrl: number;
  icmsBrl: number;
  grossTaxesBrl: number;
  creditsIpi: boolean;
  creditsPis: boolean;
  creditsCofins: boolean;
  creditsIcms: boolean;
}) {
  const credits =
    (input.creditsIpi ? input.ipiBrl : 0) +
    (input.creditsPis ? input.pisBrl : 0) +
    (input.creditsCofins ? input.cofinsBrl : 0) +
    (input.creditsIcms ? input.icmsBrl : 0);

  return Math.min(input.grossTaxesBrl, roundMoney(credits));
}

function calculateTradeCommission(input: FinalSimulationTaxPreviewInput, totalFobBrl: number) {
  const mode = input.tradeCommissionMode ?? "none";

  if (mode === "percent") {
    return roundMoney(totalFobBrl * normalizeNumber(input.tradeCommissionPercent) / 100);
  }

  if (mode === "fixed_expense") {
    return roundMoney(normalizeNumber(input.tradeCommissionAmountBrl));
  }

  return 0;
}

function hasSnapshot(value: boolean | undefined) {
  return value === true;
}

export function calculateFinalSimulationTaxPreview(input: FinalSimulationTaxPreviewInput): FinalSimulationTaxPreview {
  const warnings: FinalSimulationTaxPreviewWarning[] = [];
  const exchangeRate = normalizeNumber(input.exchangeRate);
  const totalExpensesBrl = roundMoney(normalizeNumber(input.totalExpensesBrl));
  const totalFobBrlRaw = input.items.reduce(
    (total, item) => total + normalizeNumber(item.totalPriceUsd) * exchangeRate,
    0
  );

  if (exchangeRate <= 0) {
    warnings.push({
      code: "exchange_rate_invalid",
      message: "Taxa de câmbio menor ou igual a zero."
    });
  }

  if (input.items.length === 0) {
    warnings.push({
      code: "missing_items",
      message: "Simulação sem produtos."
    });
  }

  if (totalFobBrlRaw <= 0) {
    warnings.push({
      code: "zero_total_fob",
      message: "Total FOB zerado; despesas não serão rateadas por produto."
    });
  }

  if (!hasSnapshot(input.hasEntryInvoiceSnapshot)) {
    warnings.push({
      code: "missing_entry_invoice_snapshot",
      message: "Snapshot de NF Entrada ausente."
    });
  }

  if (!hasSnapshot(input.hasExitInvoiceSnapshot)) {
    warnings.push({
      code: "missing_exit_invoice_snapshot",
      message: "Snapshot de NF Saída ausente."
    });
  }

  const items = input.items.map<FinalSimulationTaxPreviewItem>((item) => {
    if (!item.ncm?.trim()) {
      warnings.push({
        code: "missing_ncm",
        message: "Produto sem NCM informado.",
        itemId: item.itemId
      });
    }

    if (normalizeNumber(item.icmsRate) <= 0) {
      warnings.push({
        code: "zero_icms",
        message: "Produto com ICMS zerado.",
        itemId: item.itemId
      });
    }

    const fobBrl = roundMoney(normalizeNumber(item.totalPriceUsd) * exchangeRate);
    const expenseAllocationBrl = roundMoney(totalFobBrlRaw > 0 ? totalExpensesBrl * (fobBrl / totalFobBrlRaw) : 0);
    const customsBaseBrl = roundMoney(fobBrl + expenseAllocationBrl);
    const iiBrl = roundMoney(customsBaseBrl * normalizeNumber(item.iiRate) / 100);
    const ipiBaseBrl = roundMoney(customsBaseBrl + iiBrl);
    const ipiBrl = roundMoney(ipiBaseBrl * normalizeNumber(item.ipiRate) / 100);
    const pisBrl = roundMoney(customsBaseBrl * normalizeNumber(item.pisRate) / 100);
    const cofinsBrl = roundMoney(customsBaseBrl * normalizeNumber(item.cofinsRate) / 100);
    const icmsBaseBrl = roundMoney(customsBaseBrl + iiBrl + ipiBrl + pisBrl + cofinsBrl);
    const icmsBrl = roundMoney(icmsBaseBrl * normalizeNumber(item.icmsRate) / 100);
    const grossTaxesBrl = roundMoney(iiBrl + ipiBrl + pisBrl + cofinsBrl + icmsBrl);
    const taxCreditsBrl = calculateTaxCredits({
      ipiBrl,
      pisBrl,
      cofinsBrl,
      icmsBrl,
      grossTaxesBrl,
      creditsIpi: input.creditsIpi,
      creditsPis: input.creditsPis,
      creditsCofins: input.creditsCofins,
      creditsIcms: input.creditsIcms
    });
    const netTaxesBrl = roundMoney(Math.max(0, grossTaxesBrl - taxCreditsBrl));

    return {
      item_id: item.itemId,
      description: item.description,
      fob_brl: fobBrl,
      expense_allocation_brl: expenseAllocationBrl,
      customs_base_brl: customsBaseBrl,
      ii_brl: iiBrl,
      ipi_brl: ipiBrl,
      pis_brl: pisBrl,
      cofins_brl: cofinsBrl,
      icms_brl: icmsBrl,
      gross_taxes_brl: grossTaxesBrl,
      tax_credits_brl: taxCreditsBrl,
      net_taxes_brl: netTaxesBrl,
      estimated_total_cost_brl: roundMoney(customsBaseBrl + netTaxesBrl)
    };
  });

  const totalFobBrl = roundMoney(items.reduce((total, item) => total + item.fob_brl, 0));
  const totalCustomsBaseBrl = roundMoney(items.reduce((total, item) => total + item.customs_base_brl, 0));
  const grossTaxesBrl = roundMoney(items.reduce((total, item) => total + item.gross_taxes_brl, 0));
  const taxCreditsBrl = roundMoney(items.reduce((total, item) => total + item.tax_credits_brl, 0));
  const netTaxesBrl = roundMoney(Math.max(0, items.reduce((total, item) => total + item.net_taxes_brl, 0)));
  const tradeCommissionBrl = calculateTradeCommission(input, totalFobBrl);

  return {
    totals: {
      total_fob_brl: totalFobBrl,
      total_expenses_brl: totalExpensesBrl,
      total_customs_base_brl: totalCustomsBaseBrl,
      gross_taxes_brl: grossTaxesBrl,
      tax_credits_brl: taxCreditsBrl,
      net_taxes_brl: netTaxesBrl,
      trade_commission_brl: tradeCommissionBrl,
      estimated_total_cost_brl: roundMoney(totalCustomsBaseBrl + netTaxesBrl + tradeCommissionBrl)
    },
    items,
    warnings,
    meta: {
      trade_commission_mode: input.tradeCommissionMode ?? "none",
      ignore_trade_commission_contract: input.ignoreTradeCommissionContract ?? false
    }
  };
}
