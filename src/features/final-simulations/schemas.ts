import {
  editableFinalSimulationStatusValues,
  expenseAllocationTypeValues,
  expenseBehaviorValues,
  expenseCalculationTypeValues,
  expenseModalityValues,
  expensePresetTransportModeValues,
  finalSimulationImportModalityValues,
  finalSimulationStatusValues,
  finalSimulationTransportModeValues,
  type ExpensePresetItemValues,
  type ExpensePresetValues,
  type ExpenseTypeValues,
  type FinalSimulationItemValues,
  type FinalSimulationMainDataValues,
  type FinalSimulationStatus,
  type ProcessExpensePresetValues,
  type SimulationExpenseLineValues
} from "./types";

type SchemaResult<TValues> =
  | {
      success: true;
      data: TValues;
    }
  | {
      success: false;
      fieldErrors: Partial<Record<keyof TValues | "form", string>>;
      values: Partial<TValues>;
    };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function normalizeText(value: FormDataEntryValue | string | null | undefined) {
  return String(value ?? "").trim();
}

function optionalText(value: FormDataEntryValue | string | null | undefined) {
  const text = normalizeText(value);
  return text || undefined;
}

function normalizeCurrency(value: FormDataEntryValue | string | null | undefined, fallback = "USD") {
  const text = normalizeText(value || fallback).toUpperCase();
  return text || fallback;
}

function normalizeNumber(value: FormDataEntryValue | string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = normalizeText(value).replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeBoolean(value: FormDataEntryValue | string | boolean | null | undefined) {
  if (typeof value === "boolean") {
    return value;
  }

  const text = normalizeText(value).toLowerCase();
  return ["1", "true", "on", "yes", "sim"].includes(text);
}

function normalizeCheckbox(formData: FormData, field: string, fallback = false) {
  const values = formData.getAll(field);

  if (values.length === 0) {
    return fallback;
  }

  return values.some((value) => normalizeBoolean(value));
}

function optionalUuid(value: FormDataEntryValue | string | null | undefined) {
  const text = optionalText(value);
  return text;
}

function validateOptionalUuid(
  fieldErrors: Record<string, string | undefined>,
  field: string,
  value: string | undefined,
  message: string
): void {
  if (value && !uuidPattern.test(value)) {
    fieldErrors[field] = message;
  }
}

function validateOptionalDate(
  fieldErrors: Record<string, string | undefined>,
  field: string,
  value: string | undefined,
  message: string
): void {
  if (value && !datePattern.test(value)) {
    fieldErrors[field] = message;
  }
}

function hasFieldErrors(fieldErrors: Record<string, string | undefined>) {
  return Object.values(fieldErrors).some(Boolean);
}

export function isEditableFinalSimulationStatus(status: string | null | undefined): status is FinalSimulationStatus {
  return editableFinalSimulationStatusValues.includes(status as (typeof editableFinalSimulationStatusValues)[number]);
}

export function isFinalSimulationLocked(status: string | null | undefined) {
  return Boolean(status) && !isEditableFinalSimulationStatus(status);
}

export const finalSimulationStatusSchema = {
  parse(status: string): SchemaResult<{ status: FinalSimulationStatus }> {
    const normalizedStatus = normalizeText(status) || "draft";

    if (!finalSimulationStatusValues.includes(normalizedStatus as FinalSimulationStatus)) {
      return {
        success: false,
        fieldErrors: {
          status: "Selecione um status válido."
        },
        values: {
          status: normalizedStatus as FinalSimulationStatus
        }
      };
    }

    return {
      success: true,
      data: {
        status: normalizedStatus as FinalSimulationStatus
      }
    };
  }
};

function readMainData(formData: FormData): FinalSimulationMainDataValues {
  return {
    simulationId: optionalUuid(formData.get("simulationId")),
    customerId: optionalUuid(formData.get("customerId")),
    customerName: optionalText(formData.get("customerName")),
    supplierName: optionalText(formData.get("supplierName")),
    branchName: optionalText(formData.get("branchName")),
    quoteDate: optionalText(formData.get("quoteDate")),
    validUntil: optionalText(formData.get("validUntil")),
    operationType: optionalText(formData.get("operationType")),
    importModality: optionalText(formData.get("importModality")),
    goodsApplication: optionalText(formData.get("goodsApplication")),
    transportMode: optionalText(formData.get("transportMode")),
    origin: optionalText(formData.get("origin")),
    destination: optionalText(formData.get("destination")),
    finalDestination: optionalText(formData.get("finalDestination")),
    destinationState: optionalText(formData.get("destinationState")),
    destinationCity: optionalText(formData.get("destinationCity")),
    country: optionalText(formData.get("country")),
    packaging: optionalText(formData.get("packaging")),
    transitTime: optionalText(formData.get("transitTime")),
    requiresImportLicense: normalizeBoolean(formData.get("requiresImportLicense")),
    notes: optionalText(formData.get("notes")),
    incoterm: optionalText(formData.get("incoterm")),
    currency: normalizeCurrency(formData.get("currency")),
    exchangeRate: normalizeNumber(formData.get("exchangeRate"))
  };
}

function validateMainData(
  values: FinalSimulationMainDataValues,
  options: { requireSimulationId: boolean }
): Partial<Record<keyof FinalSimulationMainDataValues | "form", string>> {
  const fieldErrors: Partial<Record<keyof FinalSimulationMainDataValues | "form", string>> = {};

  if (options.requireSimulationId && !values.simulationId) {
    fieldErrors.simulationId = "Informe a simulação.";
  }

  validateOptionalUuid(fieldErrors, "simulationId", values.simulationId, "Simulação inválida.");
  validateOptionalUuid(fieldErrors, "customerId", values.customerId, "Cliente inválido.");
  validateOptionalDate(fieldErrors, "quoteDate", values.quoteDate, "Informe uma data de cotação válida.");
  validateOptionalDate(fieldErrors, "validUntil", values.validUntil, "Informe uma data de validade válida.");

  if (
    values.importModality &&
    !finalSimulationImportModalityValues.includes(values.importModality as (typeof finalSimulationImportModalityValues)[number])
  ) {
    fieldErrors.importModality = "Selecione uma modalidade válida.";
  }

  if (
    values.transportMode &&
    !finalSimulationTransportModeValues.includes(values.transportMode as (typeof finalSimulationTransportModeValues)[number])
  ) {
    fieldErrors.transportMode = "Selecione uma via de transporte válida.";
  }

  if (values.currency && values.currency.length > 3) {
    fieldErrors.currency = "Informe uma moeda com até 3 caracteres.";
  }

  if ((values.exchangeRate ?? 0) < 0) {
    fieldErrors.exchangeRate = "Informe uma taxa de câmbio válida.";
  }

  return fieldErrors;
}

export const createFinalSimulationSchema = {
  parse(formData: FormData): SchemaResult<FinalSimulationMainDataValues> {
    const values = readMainData(formData);
    const fieldErrors = validateMainData(values, { requireSimulationId: false });

    if (hasFieldErrors(fieldErrors)) {
      return {
        success: false,
        fieldErrors,
        values
      };
    }

    return {
      success: true,
      data: values
    };
  }
};

export const updateFinalSimulationMainDataSchema = {
  parse(formData: FormData): SchemaResult<FinalSimulationMainDataValues> {
    const values = readMainData(formData);
    const fieldErrors = validateMainData(values, { requireSimulationId: true });

    if (hasFieldErrors(fieldErrors)) {
      return {
        success: false,
        fieldErrors,
        values
      };
    }

    return {
      success: true,
      data: values
    };
  }
};

function readItemData(formData: FormData): FinalSimulationItemValues {
  return {
    itemId: optionalUuid(formData.get("itemId")),
    simulationId: normalizeText(formData.get("simulationId")),
    productName: optionalText(formData.get("productName")),
    productDescription: normalizeText(formData.get("productDescription")),
    hsCode: optionalText(formData.get("hsCode")),
    ncm: normalizeText(formData.get("ncm")),
    unit: optionalText(formData.get("unit")),
    quantity: normalizeNumber(formData.get("quantity")),
    unitPrice: normalizeNumber(formData.get("unitPrice")),
    currency: normalizeCurrency(formData.get("currency")),
    unitNetWeight: normalizeNumber(formData.get("unitNetWeight")),
    unitGrossWeight: normalizeNumber(formData.get("unitGrossWeight")),
    iiRate: normalizeNumber(formData.get("iiRate")),
    ipiRate: normalizeNumber(formData.get("ipiRate")),
    pisRate: normalizeNumber(formData.get("pisRate")),
    cofinsRate: normalizeNumber(formData.get("cofinsRate")),
    internalConsumption: normalizeBoolean(formData.get("internalConsumption")),
    fiscalException: optionalText(formData.get("fiscalException")),
    reducedBaseRate: normalizeNumber(formData.get("reducedBaseRate"))
  };
}

function validateItemData(
  values: FinalSimulationItemValues,
  options: { requireItemId: boolean }
): Partial<Record<keyof FinalSimulationItemValues | "form", string>> {
  const fieldErrors: Partial<Record<keyof FinalSimulationItemValues | "form", string>> = {};

  if (options.requireItemId && !values.itemId) {
    fieldErrors.itemId = "Informe o item.";
  }

  if (!values.simulationId) {
    fieldErrors.simulationId = "Informe a simulação.";
  }

  validateOptionalUuid(fieldErrors, "simulationId", values.simulationId, "Simulação inválida.");
  validateOptionalUuid(fieldErrors, "itemId", values.itemId, "Item inválido.");

  if (!values.productDescription) {
    fieldErrors.productDescription = "Informe a descrição do produto.";
  }

  if (!values.ncm) {
    fieldErrors.ncm = "Informe o NCM.";
  }

  if (values.quantity < 0) {
    fieldErrors.quantity = "Informe uma quantidade válida.";
  }

  if (values.unitPrice < 0) {
    fieldErrors.unitPrice = "Informe um valor unitário válido.";
  }

  if (values.unitNetWeight < 0) {
    fieldErrors.unitNetWeight = "Informe um peso líquido válido.";
  }

  if (values.unitGrossWeight < 0) {
    fieldErrors.unitGrossWeight = "Informe um peso bruto válido.";
  }

  if ((values.iiRate ?? 0) < 0) {
    fieldErrors.iiRate = "Informe uma alíquota II válida.";
  }

  if ((values.ipiRate ?? 0) < 0) {
    fieldErrors.ipiRate = "Informe uma alíquota IPI válida.";
  }

  if ((values.pisRate ?? 0) < 0) {
    fieldErrors.pisRate = "Informe uma alíquota PIS válida.";
  }

  if ((values.cofinsRate ?? 0) < 0) {
    fieldErrors.cofinsRate = "Informe uma alíquota COFINS válida.";
  }

  if ((values.reducedBaseRate ?? 0) < 0) {
    fieldErrors.reducedBaseRate = "Informe uma taxa base reduzida válida.";
  }

  if (values.currency && values.currency.length > 3) {
    fieldErrors.currency = "Informe uma moeda com até 3 caracteres.";
  }

  return fieldErrors;
}

export const finalSimulationItemSchema = {
  parse(formData: FormData): SchemaResult<FinalSimulationItemValues> {
    const values = readItemData(formData);
    const fieldErrors = validateItemData(values, { requireItemId: false });

    if (hasFieldErrors(fieldErrors)) {
      return {
        success: false,
        fieldErrors,
        values
      };
    }

    return {
      success: true,
      data: values
    };
  }
};

export const updateFinalSimulationItemSchema = {
  parse(formData: FormData): SchemaResult<FinalSimulationItemValues> {
    const values = readItemData(formData);
    const fieldErrors = validateItemData(values, { requireItemId: true });

    if (hasFieldErrors(fieldErrors)) {
      return {
        success: false,
        fieldErrors,
        values
      };
    }

    return {
      success: true,
      data: values
    };
  }
};

function readExpenseTypeData(formData: FormData): ExpenseTypeValues {
  return {
    expenseTypeId: optionalUuid(formData.get("expenseTypeId")),
    code: optionalText(formData.get("code")),
    description: normalizeText(formData.get("description")),
    key: optionalText(formData.get("key")),
    printOrder: normalizeNumber(formData.get("printOrder")),
    expenseModality: normalizeText(formData.get("expenseModality")) || "expense",
    expenseModalityLabel: optionalText(formData.get("expenseModalityLabel")),
    allocationType: normalizeText(formData.get("allocationType")) || "value",
    allocationTypeLabel: optionalText(formData.get("allocationTypeLabel")),
    expenseCalculationType: normalizeText(formData.get("expenseCalculationType")) || "parameters",
    expenseCalculationLabel: optionalText(formData.get("expenseCalculationLabel")),
    ownImportBehavior: normalizeText(formData.get("ownImportBehavior")) || "not_applicable",
    ownImportBehaviorLabel: optionalText(formData.get("ownImportBehaviorLabel")),
    orderAccountBehavior: normalizeText(formData.get("orderAccountBehavior")) || "not_applicable",
    orderAccountBehaviorLabel: optionalText(formData.get("orderAccountBehaviorLabel")),
    encomendaBehavior: normalizeText(formData.get("encomendaBehavior")) || "not_applicable",
    encomendaBehaviorLabel: optionalText(formData.get("encomendaBehaviorLabel")),
    expenseResulting: optionalText(formData.get("expenseResulting")),
    siscomexAdditionId: optionalUuid(formData.get("siscomexAdditionId")),
    expenseGroupId: optionalUuid(formData.get("expenseGroupId")),
    expenseGroupName: optionalText(formData.get("expenseGroupName")),
    considersContainer: normalizeBoolean(formData.get("considersContainer")),
    considersIcmsEntryInvoice: normalizeBoolean(formData.get("considersIcmsEntryInvoice")),
    composesServiceInvoice: normalizeBoolean(formData.get("composesServiceInvoice")),
    titleTypeId: optionalUuid(formData.get("titleTypeId")),
    titleTypeName: optionalText(formData.get("titleTypeName")),
    serviceId: optionalUuid(formData.get("serviceId")),
    serviceName: optionalText(formData.get("serviceName")),
    bankAccountId: optionalUuid(formData.get("bankAccountId")),
    bankAccountName: optionalText(formData.get("bankAccountName")),
    erpKey: optionalText(formData.get("erpKey")),
    paidByCashOwnImport: normalizeBoolean(formData.get("paidByCashOwnImport")),
    paidByCashEncomenda: normalizeBoolean(formData.get("paidByCashEncomenda")),
    paidByCashOrderAccount: normalizeBoolean(formData.get("paidByCashOrderAccount")),
    paidByCashDirectExport: normalizeBoolean(formData.get("paidByCashDirectExport")),
    paidByCashIndirectExport: normalizeBoolean(formData.get("paidByCashIndirectExport")),
    isActive: normalizeCheckbox(formData, "isActive", true)
  };
}

function validateExpenseTypeData(
  values: ExpenseTypeValues,
  options: { requireExpenseTypeId: boolean }
): Partial<Record<keyof ExpenseTypeValues | "form", string>> {
  const fieldErrors: Partial<Record<keyof ExpenseTypeValues | "form", string>> = {};

  if (options.requireExpenseTypeId && !values.expenseTypeId) {
    fieldErrors.expenseTypeId = "Informe o tipo de despesa.";
  }

  validateOptionalUuid(fieldErrors, "expenseTypeId", values.expenseTypeId, "Tipo de despesa inválido.");
  validateOptionalUuid(fieldErrors, "siscomexAdditionId", values.siscomexAdditionId, "Adição Siscomex inválida.");
  validateOptionalUuid(fieldErrors, "expenseGroupId", values.expenseGroupId, "Grupo de despesa inválido.");
  validateOptionalUuid(fieldErrors, "titleTypeId", values.titleTypeId, "Tipo de título inválido.");
  validateOptionalUuid(fieldErrors, "serviceId", values.serviceId, "Serviço inválido.");
  validateOptionalUuid(fieldErrors, "bankAccountId", values.bankAccountId, "Conta bancária inválida.");

  if (!values.description) {
    fieldErrors.description = "Informe a descrição.";
  }

  if (values.printOrder !== undefined && values.printOrder < 0) {
    fieldErrors.printOrder = "Informe uma ordem válida.";
  }

  if (!expenseModalityValues.includes(values.expenseModality as (typeof expenseModalityValues)[number])) {
    fieldErrors.expenseModality = "Selecione uma modalidade válida.";
  }

  if (!expenseAllocationTypeValues.includes(values.allocationType as (typeof expenseAllocationTypeValues)[number])) {
    fieldErrors.allocationType = "Selecione um tipo de rateio válido.";
  }

  if (
    !expenseCalculationTypeValues.includes(values.expenseCalculationType as (typeof expenseCalculationTypeValues)[number])
  ) {
    fieldErrors.expenseCalculationType = "Selecione um tipo de cálculo válido.";
  }

  if (!expenseBehaviorValues.includes(values.ownImportBehavior as (typeof expenseBehaviorValues)[number])) {
    fieldErrors.ownImportBehavior = "Selecione um comportamento válido.";
  }

  if (!expenseBehaviorValues.includes(values.orderAccountBehavior as (typeof expenseBehaviorValues)[number])) {
    fieldErrors.orderAccountBehavior = "Selecione um comportamento válido.";
  }

  if (!expenseBehaviorValues.includes(values.encomendaBehavior as (typeof expenseBehaviorValues)[number])) {
    fieldErrors.encomendaBehavior = "Selecione um comportamento válido.";
  }

  return fieldErrors;
}

function readExpensePresetData(formData: FormData): ExpensePresetValues {
  return {
    expensePresetId: optionalUuid(formData.get("expensePresetId")),
    name: normalizeText(formData.get("name")),
    description: optionalText(formData.get("description")),
    transportMode: normalizeText(formData.get("transportMode")),
    isActive: normalizeCheckbox(formData, "isActive", true)
  };
}

function validateExpensePresetData(
  values: ExpensePresetValues,
  options: { requireExpensePresetId: boolean }
): Partial<Record<keyof ExpensePresetValues | "form", string>> {
  const fieldErrors: Partial<Record<keyof ExpensePresetValues | "form", string>> = {};

  if (options.requireExpensePresetId && !values.expensePresetId) {
    fieldErrors.expensePresetId = "Informe o pré-cálculo.";
  }

  validateOptionalUuid(fieldErrors, "expensePresetId", values.expensePresetId, "Pré-cálculo inválido.");

  if (!values.name) {
    fieldErrors.name = "Informe o nome.";
  }

  if (!expensePresetTransportModeValues.includes(values.transportMode as (typeof expensePresetTransportModeValues)[number])) {
    fieldErrors.transportMode = "Selecione uma via de transporte válida.";
  }

  return fieldErrors;
}

function readExpensePresetItemData(formData: FormData): ExpensePresetItemValues {
  return {
    expensePresetItemId: optionalUuid(formData.get("expensePresetItemId")),
    presetId: normalizeText(formData.get("presetId")),
    expenseTypeId: normalizeText(formData.get("expenseTypeId")),
    defaultAmountBrl: normalizeNumber(formData.get("defaultAmountBrl")),
    defaultAmountUsd: normalizeNumber(formData.get("defaultAmountUsd")),
    defaultCurrency: normalizeCurrency(formData.get("defaultCurrency"), "BRL"),
    overrideCalculationType: optionalText(formData.get("overrideCalculationType")),
    overrideAllocationType: optionalText(formData.get("overrideAllocationType")),
    overrideBehavior: optionalText(formData.get("overrideBehavior")),
    isEditable: normalizeCheckbox(formData, "isEditable", true),
    sortOrder: normalizeNumber(formData.get("sortOrder")),
    notes: optionalText(formData.get("notes"))
  };
}

function validateExpensePresetItemData(
  values: ExpensePresetItemValues,
  options: { requireExpensePresetItemId: boolean }
): Partial<Record<keyof ExpensePresetItemValues | "form", string>> {
  const fieldErrors: Partial<Record<keyof ExpensePresetItemValues | "form", string>> = {};

  if (options.requireExpensePresetItemId && !values.expensePresetItemId) {
    fieldErrors.expensePresetItemId = "Informe o item do pré-cálculo.";
  }

  validateOptionalUuid(
    fieldErrors,
    "expensePresetItemId",
    values.expensePresetItemId,
    "Item do pré-cálculo inválido."
  );

  if (!values.presetId || !uuidPattern.test(values.presetId)) {
    fieldErrors.presetId = "Informe um pré-cálculo válido.";
  }

  if (!values.expenseTypeId || !uuidPattern.test(values.expenseTypeId)) {
    fieldErrors.expenseTypeId = "Informe um tipo de despesa válido.";
  }

  if ((values.defaultAmountBrl ?? 0) < 0) {
    fieldErrors.defaultAmountBrl = "Informe um valor BRL válido.";
  }

  if ((values.defaultAmountUsd ?? 0) < 0) {
    fieldErrors.defaultAmountUsd = "Informe um valor USD válido.";
  }

  if (values.defaultCurrency && values.defaultCurrency.length > 3) {
    fieldErrors.defaultCurrency = "Informe uma moeda com até 3 caracteres.";
  }

  if (
    values.overrideCalculationType &&
    !expenseCalculationTypeValues.includes(values.overrideCalculationType as (typeof expenseCalculationTypeValues)[number])
  ) {
    fieldErrors.overrideCalculationType = "Selecione um tipo de cálculo válido.";
  }

  if (
    values.overrideAllocationType &&
    !expenseAllocationTypeValues.includes(values.overrideAllocationType as (typeof expenseAllocationTypeValues)[number])
  ) {
    fieldErrors.overrideAllocationType = "Selecione um tipo de rateio válido.";
  }

  if (
    values.overrideBehavior &&
    !expenseBehaviorValues.includes(values.overrideBehavior as (typeof expenseBehaviorValues)[number])
  ) {
    fieldErrors.overrideBehavior = "Selecione um comportamento válido.";
  }

  return fieldErrors;
}

export const createExpenseTypeSchema = {
  parse(formData: FormData): SchemaResult<ExpenseTypeValues> {
    const values = readExpenseTypeData(formData);
    const fieldErrors = validateExpenseTypeData(values, { requireExpenseTypeId: false });

    if (hasFieldErrors(fieldErrors)) {
      return { success: false, fieldErrors, values };
    }

    return { success: true, data: values };
  }
};

export const updateExpenseTypeSchema = {
  parse(formData: FormData): SchemaResult<ExpenseTypeValues> {
    const values = readExpenseTypeData(formData);
    const fieldErrors = validateExpenseTypeData(values, { requireExpenseTypeId: true });

    if (hasFieldErrors(fieldErrors)) {
      return { success: false, fieldErrors, values };
    }

    return { success: true, data: values };
  }
};

export const createExpensePresetSchema = {
  parse(formData: FormData): SchemaResult<ExpensePresetValues> {
    const values = readExpensePresetData(formData);
    const fieldErrors = validateExpensePresetData(values, { requireExpensePresetId: false });

    if (hasFieldErrors(fieldErrors)) {
      return { success: false, fieldErrors, values };
    }

    return { success: true, data: values };
  }
};

export const updateExpensePresetSchema = {
  parse(formData: FormData): SchemaResult<ExpensePresetValues> {
    const values = readExpensePresetData(formData);
    const fieldErrors = validateExpensePresetData(values, { requireExpensePresetId: true });

    if (hasFieldErrors(fieldErrors)) {
      return { success: false, fieldErrors, values };
    }

    return { success: true, data: values };
  }
};

export const createExpensePresetItemSchema = {
  parse(formData: FormData): SchemaResult<ExpensePresetItemValues> {
    const values = readExpensePresetItemData(formData);
    const fieldErrors = validateExpensePresetItemData(values, { requireExpensePresetItemId: false });

    if (hasFieldErrors(fieldErrors)) {
      return { success: false, fieldErrors, values };
    }

    return { success: true, data: values };
  }
};

export const updateExpensePresetItemSchema = {
  parse(formData: FormData): SchemaResult<ExpensePresetItemValues> {
    const values = readExpensePresetItemData(formData);
    const fieldErrors = validateExpensePresetItemData(values, { requireExpensePresetItemId: true });

    if (hasFieldErrors(fieldErrors)) {
      return { success: false, fieldErrors, values };
    }

    return { success: true, data: values };
  }
};

function readProcessExpensePresetData(formData: FormData): ProcessExpensePresetValues {
  return {
    simulationId: normalizeText(formData.get("simulationId")),
    presetId: normalizeText(formData.get("presetId"))
  };
}

function validateProcessExpensePresetData(
  values: ProcessExpensePresetValues
): Partial<Record<keyof ProcessExpensePresetValues | "form", string>> {
  const fieldErrors: Partial<Record<keyof ProcessExpensePresetValues | "form", string>> = {};

  if (!values.simulationId || !uuidPattern.test(values.simulationId)) {
    fieldErrors.simulationId = "Informe uma simulação válida.";
  }

  if (!values.presetId || !uuidPattern.test(values.presetId)) {
    fieldErrors.presetId = "Selecione um pré-cálculo válido.";
  }

  return fieldErrors;
}

function readSimulationExpenseLineData(formData: FormData): SimulationExpenseLineValues {
  return {
    expenseLineId: optionalUuid(formData.get("expenseLineId")),
    simulationId: normalizeText(formData.get("simulationId")),
    expenseName: normalizeText(formData.get("expenseName")),
    expenseCode: optionalText(formData.get("expenseCode")),
    expenseCategory: optionalText(formData.get("expenseCategory")),
    description: optionalText(formData.get("description")),
    amountBrl: normalizeNumber(formData.get("amountBrl")),
    amountUsd: normalizeNumber(formData.get("amountUsd")),
    currency: normalizeCurrency(formData.get("currency"), "BRL"),
    calculationType: optionalText(formData.get("calculationType")),
    allocationType: optionalText(formData.get("allocationType")),
    appliedBehavior: optionalText(formData.get("appliedBehavior")),
    notes: optionalText(formData.get("notes"))
  };
}

function validateSimulationExpenseLineData(
  values: SimulationExpenseLineValues,
  options: { requireExpenseLineId: boolean }
): Partial<Record<keyof SimulationExpenseLineValues | "form", string>> {
  const fieldErrors: Partial<Record<keyof SimulationExpenseLineValues | "form", string>> = {};

  if (options.requireExpenseLineId && !values.expenseLineId) {
    fieldErrors.expenseLineId = "Informe a despesa.";
  }

  validateOptionalUuid(fieldErrors, "expenseLineId", values.expenseLineId, "Despesa inválida.");

  if (!values.simulationId || !uuidPattern.test(values.simulationId)) {
    fieldErrors.simulationId = "Informe uma simulação válida.";
  }

  if (!values.expenseName) {
    fieldErrors.expenseName = "Informe a despesa.";
  }

  if ((values.amountBrl ?? 0) < 0) {
    fieldErrors.amountBrl = "Informe um valor BRL válido.";
  }

  if ((values.amountUsd ?? 0) < 0) {
    fieldErrors.amountUsd = "Informe um valor USD válido.";
  }

  if (values.currency && values.currency.length > 3) {
    fieldErrors.currency = "Informe uma moeda com até 3 caracteres.";
  }

  if (
    values.calculationType &&
    !expenseCalculationTypeValues.includes(values.calculationType as (typeof expenseCalculationTypeValues)[number])
  ) {
    fieldErrors.calculationType = "Selecione um tipo de cálculo válido.";
  }

  if (
    values.allocationType &&
    !expenseAllocationTypeValues.includes(values.allocationType as (typeof expenseAllocationTypeValues)[number])
  ) {
    fieldErrors.allocationType = "Selecione um tipo de rateio válido.";
  }

  if (
    values.appliedBehavior &&
    !expenseBehaviorValues.includes(values.appliedBehavior as (typeof expenseBehaviorValues)[number])
  ) {
    fieldErrors.appliedBehavior = "Selecione um comportamento válido.";
  }

  return fieldErrors;
}

export const processExpensePresetSchema = {
  parse(formData: FormData): SchemaResult<ProcessExpensePresetValues> {
    const values = readProcessExpensePresetData(formData);
    const fieldErrors = validateProcessExpensePresetData(values);

    if (hasFieldErrors(fieldErrors)) {
      return { success: false, fieldErrors, values };
    }

    return { success: true, data: values };
  }
};

export const manualSimulationExpenseSchema = {
  parse(formData: FormData): SchemaResult<SimulationExpenseLineValues> {
    const values = readSimulationExpenseLineData(formData);
    const fieldErrors = validateSimulationExpenseLineData(values, { requireExpenseLineId: false });

    if (hasFieldErrors(fieldErrors)) {
      return { success: false, fieldErrors, values };
    }

    return { success: true, data: values };
  }
};

export const updateSimulationExpenseLineSchema = {
  parse(formData: FormData): SchemaResult<SimulationExpenseLineValues> {
    const values = readSimulationExpenseLineData(formData);
    const fieldErrors = validateSimulationExpenseLineData(values, { requireExpenseLineId: true });

    if (hasFieldErrors(fieldErrors)) {
      return { success: false, fieldErrors, values };
    }

    return { success: true, data: values };
  }
};
