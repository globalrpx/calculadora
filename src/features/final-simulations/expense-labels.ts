import type {
  ExpenseAllocationType,
  ExpenseBehavior,
  ExpenseCalculationType,
  ExpenseModality,
  ExpensePresetTransportMode
} from "./types";

export const expenseModalityLabels: Record<ExpenseModality, string> = {
  tax: "Imposto",
  expense: "Despesa",
  calculation_base: "Base de cálculo"
};

export const expenseAllocationTypeLabels: Record<ExpenseAllocationType, string> = {
  value: "Valor",
  net_weight: "Peso líquido",
  cif: "CIF",
  gross_weight: "Peso bruto"
};

export const expenseCalculationTypeLabels: Record<ExpenseCalculationType, string> = {
  parameters: "Considera parâmetros",
  fob: "FOB",
  freight: "Frete",
  insurance: "Seguro",
  cif: "CIF",
  ii: "II",
  ipi: "IPI",
  icms: "ICMS"
};

export const expenseBehaviorLabels: Record<ExpenseBehavior, string> = {
  accessory_expense: "Despesa acessória",
  tax_base: "Base imposto",
  icms_base: "Base ICMS",
  not_applicable: "Não",
  product_cost_only: "Somente custo produto",
  icms_base_courier_fine: "Base ICMS multa courier",
  ipi_base: "Base IPI"
};

export const expensePresetTransportModeLabels: Record<ExpensePresetTransportMode, string> = {
  maritimo: "Marítimo",
  aereo: "Aéreo",
  rodoviario: "Rodoviário"
};
