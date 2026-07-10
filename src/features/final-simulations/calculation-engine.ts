import type { FinalSimulationItemRow, FinalSimulationItemValues } from "./types";

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
