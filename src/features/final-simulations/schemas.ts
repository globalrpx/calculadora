import {
  editableFinalSimulationStatusValues,
  finalSimulationImportModalityValues,
  finalSimulationStatusValues,
  finalSimulationTransportModeValues,
  type FinalSimulationItemValues,
  type FinalSimulationMainDataValues,
  type FinalSimulationStatus
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
