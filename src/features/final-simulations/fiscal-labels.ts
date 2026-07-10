import type {
  InvoiceParametrizationCustomerProfile,
  InvoiceParametrizationDestinationScope,
  InvoiceParametrizationOperationGroup,
  InvoiceParametrizationOperationType,
  InvoiceParametrizationTaxRegime,
  TradeCommissionMode
} from "./types";

export const invoiceParametrizationOperationTypeLabels: Record<InvoiceParametrizationOperationType, string> = {
  entrada: "NF Entrada",
  saida: "NF Saída"
};

export const invoiceParametrizationOperationGroupLabels: Record<InvoiceParametrizationOperationGroup, string> = {
  conta_e_ordem: "Conta e ordem",
  venda_mercadoria: "Venda de mercadoria",
  unificado: "Unificado",
  compra_comercializacao: "Compra para comercialização",
  simulacao_terceiros: "Simulação terceiros",
  outro: "Outro"
};

export const invoiceParametrizationTaxRegimeLabels: Record<InvoiceParametrizationTaxRegime, string> = {
  simples_nacional: "Simples Nacional",
  lucro_real: "Lucro Real",
  lucro_presumido: "Lucro Presumido",
  consumidor_final: "Consumidor final",
  outro: "Outro"
};

export const invoiceParametrizationDestinationScopeLabels: Record<InvoiceParametrizationDestinationScope, string> = {
  interno: "Interno",
  interestadual: "Interestadual",
  fora_estado: "Fora do estado",
  outro: "Outro"
};

export const invoiceParametrizationCustomerProfileLabels: Record<InvoiceParametrizationCustomerProfile, string> = {
  revenda: "Revenda",
  consumidor_final: "Consumidor final",
  industria: "Indústria",
  outro: "Outro"
};

export const tradeCommissionModeLabels: Record<TradeCommissionMode, string> = {
  none: "Não considerar",
  percent: "Percentual",
  fixed_expense: "Valor fixo"
};
