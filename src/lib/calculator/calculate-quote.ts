export type QuoteInput = {
  productName: string;
  hsCode: string;
  fobUnitUsd: number;
  quantity: number;
  usedDollar: number;
  rpxFactor: number;
  directImportFactor: number;
};

export type QuoteResult = {
  fobTotalUsd: number;
  unitCostRpxBrl: number;
  totalCostRpxBrl: number;
  unitCostDirectBrl: number;
  totalCostDirectBrl: number;
  savingsBrl: number;
  savingsPercent: number;
};

export function calculateQuote(input: QuoteInput): QuoteResult {
  const fobTotalUsd = input.fobUnitUsd * input.quantity;
  const unitCostRpxBrl = input.fobUnitUsd * input.usedDollar * input.rpxFactor;
  const totalCostRpxBrl = unitCostRpxBrl * input.quantity;
  const unitCostDirectBrl = input.fobUnitUsd * input.usedDollar * input.directImportFactor;
  const totalCostDirectBrl = unitCostDirectBrl * input.quantity;
  const savingsBrl = totalCostDirectBrl - totalCostRpxBrl;
  const savingsPercent = totalCostDirectBrl > 0 ? savingsBrl / totalCostDirectBrl : 0;

  return {
    fobTotalUsd,
    unitCostRpxBrl,
    totalCostRpxBrl,
    unitCostDirectBrl,
    totalCostDirectBrl,
    savingsBrl,
    savingsPercent
  };
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD"
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatBrl(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1
  }).format(Number.isFinite(value) ? value : 0);
}
