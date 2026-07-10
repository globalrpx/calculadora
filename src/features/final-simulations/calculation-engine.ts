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

export function normalizeNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
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
