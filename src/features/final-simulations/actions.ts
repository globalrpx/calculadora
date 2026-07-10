"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/get-session-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateFinalSimulationTaxPreview,
  calculateItemTotalsFromValues,
  calculateSimulationBasicTotals,
  calculateSimulationExpensesTotal
} from "./calculation-engine";
import {
  buildFinalSimulationClientReportData,
  buildFinalSimulationInternalSnapshot,
  buildFinalSimulationPublicSnapshot
} from "./client-report-builder";
import { expenseBehaviorLabels } from "./expense-labels";
import {
  createExpensePresetItemSchema,
  createExpensePresetSchema,
  createExpenseTypeSchema,
  createFinalSimulationSchema,
  finalSimulationFiscalSettingsSchema,
  finalSimulationItemSchema,
  invoiceParametrizationSchema,
  isFinalSimulationLocked,
  manualSimulationExpenseSchema,
  processExpensePresetSchema,
  updateInvoiceParametrizationSchema,
  updateExpensePresetItemSchema,
  updateExpensePresetSchema,
  updateExpenseTypeSchema,
  updateFinalSimulationItemSchema,
  updateFinalSimulationMainDataSchema,
  updateSimulationExpenseLineSchema
} from "./schemas";
import { getFinalSimulationTaxPreviewInput } from "./queries";
import type {
  ExpenseBehavior,
  ExpensePresetItem,
  ExpensePresetItemValues,
  ExpensePresetValues,
  ExpenseType,
  ExpenseTypeValues,
  FinalSimulationActionState,
  FinalSimulationFiscalSettingsInput,
  FinalSimulationItemRow,
  FinalSimulationItemValues,
  FinalSimulationMainDataValues,
  FinalSimulationRow,
  InvoiceParametrization,
  InvoiceParametrizationFormInput,
  NcmCodeRow,
  NcmTaxProfileRow,
  ProcessExpensePresetValues,
  SimulationExpenseLine,
  SimulationExpenseLineValues
} from "./types";

const reviewFieldsMessage = "Revise os campos destacados antes de continuar.";
const unexpectedSaveMessage = "Não foi possível salvar a simulação final. Tente novamente em instantes.";
const lockedSimulationMessage = "Esta simulação final não pode ser editada neste status.";

function emptyToNull(value: string | undefined) {
  return value?.trim() ? value.trim() : null;
}

function revalidateFinalSimulationPaths(simulationId?: string) {
  revalidatePath("/admin/simulacoes-finais");

  if (simulationId) {
    revalidatePath(`/admin/simulacoes-finais/${simulationId}`);
    revalidatePath(`/admin/simulacoes-finais/${simulationId}/preview-cliente`);
  }
}

function revalidateExpenseMasterPaths() {
  revalidatePath("/admin/simulacoes-finais");
}

function buildActionError<TValues>(
  values: Partial<TValues>,
  fieldErrors: Partial<Record<keyof TValues | "form", string>>,
  message = reviewFieldsMessage
): FinalSimulationActionState<TValues> {
  return {
    success: false,
    message,
    fieldErrors,
    values
  };
}

async function requireAdminUser() {
  const { appUser } = await requireRole("admin");
  return appUser;
}

async function getEditableSimulation(adminSupabase: ReturnType<typeof createAdminClient>, simulationId: string) {
  const { data, error } = await adminSupabase
    .from("final_simulations")
    .select("id, status, import_modality, transport_mode")
    .eq("id", simulationId)
    .maybeSingle();

  if (error || !data) {
    return {
      error: "Simulação final não encontrada.",
      simulation: null
    };
  }

  const simulation = data as Pick<FinalSimulationRow, "id" | "status" | "import_modality" | "transport_mode">;

  if (isFinalSimulationLocked(simulation.status)) {
    return {
      error: lockedSimulationMessage,
      simulation: null
    };
  }

  return {
    error: null,
    simulation
  };
}

async function findCustomerSnapshot(adminSupabase: ReturnType<typeof createAdminClient>, customerId?: string) {
  if (!customerId) {
    return {
      error: null,
      customerName: null
    };
  }

  const { data, error } = await adminSupabase
    .from("clients")
    .select("id, company_name, trade_name, contact_name, contact_email")
    .eq("id", customerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return {
      error: "Cliente não encontrado.",
      customerName: null
    };
  }

  return {
    error: null,
    customerName: data.trade_name || data.company_name || data.contact_name || data.contact_email || null
  };
}

function buildMainDataPayload(values: FinalSimulationMainDataValues, appUserId: string, customerName: string | null) {
  return {
    customer_id: values.customerId || null,
    customer_name: values.customerName || customerName,
    supplier_name: emptyToNull(values.supplierName),
    branch_name: emptyToNull(values.branchName),
    quote_date: values.quoteDate || null,
    valid_until: values.validUntil || null,
    operation_type: emptyToNull(values.operationType),
    import_modality: values.importModality || null,
    goods_application: emptyToNull(values.goodsApplication),
    transport_mode: values.transportMode || null,
    origin: emptyToNull(values.origin),
    destination: emptyToNull(values.destination),
    final_destination: emptyToNull(values.finalDestination),
    destination_state: emptyToNull(values.destinationState),
    destination_city: emptyToNull(values.destinationCity),
    country: emptyToNull(values.country),
    packaging: emptyToNull(values.packaging),
    transit_time: emptyToNull(values.transitTime),
    requires_import_license: Boolean(values.requiresImportLicense),
    notes: emptyToNull(values.notes),
    incoterm: emptyToNull(values.incoterm),
    currency: values.currency || "USD",
    exchange_rate: values.exchangeRate ?? 0,
    updated_by: appUserId
  };
}

function buildExpenseTypePayload(values: ExpenseTypeValues, appUserId: string) {
  return {
    code: emptyToNull(values.code),
    description: values.description,
    key: emptyToNull(values.key),
    print_order: values.printOrder ?? 0,
    expense_modality: values.expenseModality || "expense",
    expense_modality_label: emptyToNull(values.expenseModalityLabel),
    allocation_type: values.allocationType || "value",
    allocation_type_label: emptyToNull(values.allocationTypeLabel),
    expense_calculation_type: values.expenseCalculationType || "parameters",
    expense_calculation_label: emptyToNull(values.expenseCalculationLabel),
    own_import_behavior: values.ownImportBehavior || "not_applicable",
    own_import_behavior_label: emptyToNull(values.ownImportBehaviorLabel),
    order_account_behavior: values.orderAccountBehavior || "not_applicable",
    order_account_behavior_label: emptyToNull(values.orderAccountBehaviorLabel),
    encomenda_behavior: values.encomendaBehavior || "not_applicable",
    encomenda_behavior_label: emptyToNull(values.encomendaBehaviorLabel),
    expense_resulting: emptyToNull(values.expenseResulting),
    siscomex_addition_id: values.siscomexAdditionId || null,
    expense_group_id: values.expenseGroupId || null,
    expense_group_name: emptyToNull(values.expenseGroupName),
    considers_container: Boolean(values.considersContainer),
    considers_icms_entry_invoice: Boolean(values.considersIcmsEntryInvoice),
    composes_service_invoice: Boolean(values.composesServiceInvoice),
    title_type_id: values.titleTypeId || null,
    title_type_name: emptyToNull(values.titleTypeName),
    service_id: values.serviceId || null,
    service_name: emptyToNull(values.serviceName),
    bank_account_id: values.bankAccountId || null,
    bank_account_name: emptyToNull(values.bankAccountName),
    erp_key: emptyToNull(values.erpKey),
    paid_by_cash_own_import: Boolean(values.paidByCashOwnImport),
    paid_by_cash_encomenda: Boolean(values.paidByCashEncomenda),
    paid_by_cash_order_account: Boolean(values.paidByCashOrderAccount),
    paid_by_cash_direct_export: Boolean(values.paidByCashDirectExport),
    paid_by_cash_indirect_export: Boolean(values.paidByCashIndirectExport),
    is_active: values.isActive ?? true,
    updated_by: appUserId
  };
}

function buildExpensePresetPayload(values: ExpensePresetValues, appUserId: string) {
  return {
    name: values.name,
    description: emptyToNull(values.description),
    transport_mode: values.transportMode,
    is_active: values.isActive ?? true,
    updated_by: appUserId
  };
}

function buildInvoiceParametrizationPayload(values: InvoiceParametrizationFormInput, appUserId: string) {
  return {
    code: values.code,
    key: emptyToNull(values.key),
    operation_type: values.operationType,
    description: values.description,
    operation_nature: emptyToNull(values.operationNature),
    cfop: emptyToNull(values.cfop),
    operation_group: emptyToNull(values.operationGroup),
    tax_regime: emptyToNull(values.taxRegime),
    icms_rate: values.icmsRate ?? 0,
    destination_scope: emptyToNull(values.destinationScope),
    customer_profile: emptyToNull(values.customerProfile),
    is_unified: values.isUnified ?? false,
    branch_id: values.branchId || null,
    branch_name: emptyToNull(values.branchName),
    customer_id: values.customerId || null,
    customer_name: emptyToNull(values.customerName),
    is_active: values.isActive ?? true,
    internal_notes: emptyToNull(values.internalNotes),
    updated_by: appUserId
  };
}

function buildInvoiceParametrizationSnapshot(invoiceParametrization: InvoiceParametrization) {
  return {
    id: invoiceParametrization.id,
    code: invoiceParametrization.code,
    key: invoiceParametrization.key,
    operation_type: invoiceParametrization.operation_type,
    description: invoiceParametrization.description,
    operation_nature: invoiceParametrization.operation_nature,
    cfop: invoiceParametrization.cfop,
    operation_group: invoiceParametrization.operation_group,
    tax_regime: invoiceParametrization.tax_regime,
    icms_rate: invoiceParametrization.icms_rate,
    destination_scope: invoiceParametrization.destination_scope,
    customer_profile: invoiceParametrization.customer_profile,
    is_unified: invoiceParametrization.is_unified,
    branch_id: invoiceParametrization.branch_id,
    branch_name: invoiceParametrization.branch_name,
    customer_id: invoiceParametrization.customer_id,
    customer_name: invoiceParametrization.customer_name,
    snapshot_created_at: new Date().toISOString()
  };
}

async function findActiveInvoiceParametrization(
  adminSupabase: ReturnType<typeof createAdminClient>,
  id: string,
  operationType: InvoiceParametrization["operation_type"]
) {
  const { data, error } = await adminSupabase
    .from("invoice_parametrizations")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return {
      error: "Parametrização fiscal ativa não encontrada.",
      invoiceParametrization: null
    };
  }

  const invoiceParametrization = data as InvoiceParametrization;

  if (invoiceParametrization.operation_type !== operationType) {
    return {
      error:
        operationType === "entrada"
          ? "A parametrização de NF entrada deve ter tipo entrada."
          : "A parametrização de NF saída deve ter tipo saída.",
      invoiceParametrization: null
    };
  }

  return {
    error: null,
    invoiceParametrization
  };
}

async function findExpenseTypeSnapshot(adminSupabase: ReturnType<typeof createAdminClient>, expenseTypeId: string) {
  const { data, error } = await adminSupabase
    .from("expense_types")
    .select("id, code, description")
    .eq("id", expenseTypeId)
    .maybeSingle();

  if (error || !data) {
    return {
      error: "Tipo de despesa não encontrado.",
      expenseType: null
    };
  }

  return {
    error: null,
    expenseType: data as Pick<ExpenseType, "id" | "code" | "description">
  };
}

async function buildExpensePresetItemPayload(
  adminSupabase: ReturnType<typeof createAdminClient>,
  values: ExpensePresetItemValues,
  appUserId: string
) {
  const expenseType = await findExpenseTypeSnapshot(adminSupabase, values.expenseTypeId);

  if (expenseType.error || !expenseType.expenseType) {
    return {
      error: expenseType.error ?? unexpectedSaveMessage,
      payload: null
    };
  }

  return {
    error: null,
    payload: {
      preset_id: values.presetId,
      expense_type_id: values.expenseTypeId,
      expense_code_snapshot: emptyToNull(expenseType.expenseType.code ?? undefined),
      expense_description_snapshot: expenseType.expenseType.description,
      default_amount_brl: values.defaultAmountBrl ?? 0,
      default_amount_usd: values.defaultAmountUsd ?? 0,
      default_currency: values.defaultCurrency || "BRL",
      override_calculation_type: emptyToNull(values.overrideCalculationType),
      override_allocation_type: emptyToNull(values.overrideAllocationType),
      override_behavior: emptyToNull(values.overrideBehavior),
      is_editable: values.isEditable ?? true,
      sort_order: values.sortOrder ?? 0,
      notes: emptyToNull(values.notes),
      updated_by: appUserId
    }
  };
}

async function getNcmSnapshot(adminSupabase: ReturnType<typeof createAdminClient>, ncm: string) {
  const { data: ncmData } = await adminSupabase
    .from("ncm_codes")
    .select("*")
    .eq("code", ncm)
    .eq("is_active", true)
    .maybeSingle();

  const ncmCode = (ncmData ?? null) as NcmCodeRow | null;

  if (!ncmCode) {
    return {
      officialDescription: null,
      source: null,
      sourceUpdatedAt: null,
      taxProfile: null,
      taxSnapshot: {
        ncm_found: false
      }
    };
  }

  const { data: taxProfileData } = await adminSupabase
    .from("ncm_tax_profiles")
    .select("*")
    .eq("ncm_code", ncmCode.code)
    .order("effective_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const taxProfile = (taxProfileData ?? null) as NcmTaxProfileRow | null;

  return {
    officialDescription: ncmCode.description,
    source: taxProfile?.source ?? ncmCode.source,
    sourceUpdatedAt: taxProfile?.source_updated_at ?? ncmCode.source_updated_at,
    taxProfile,
    taxSnapshot: {
      ncm_found: true,
      code: ncmCode.code,
      description: ncmCode.description,
      hierarchical_description: ncmCode.hierarchical_description,
      legal_act: ncmCode.legal_act,
      source: ncmCode.source,
      source_updated_at: ncmCode.source_updated_at,
      tax_profile: taxProfile
        ? {
            id: taxProfile.id,
            country_code: taxProfile.country_code,
            operation_type: taxProfile.operation_type,
            effective_date: taxProfile.effective_date,
            ii_rate: taxProfile.ii_rate,
            ipi_rate: taxProfile.ipi_rate,
            pis_rate: taxProfile.pis_rate,
            cofins_rate: taxProfile.cofins_rate,
            icms_rate: taxProfile.icms_rate,
            source: taxProfile.source,
            source_updated_at: taxProfile.source_updated_at
          }
        : null
    }
  };
}

async function buildItemPayload(adminSupabase: ReturnType<typeof createAdminClient>, values: FinalSimulationItemValues) {
  const totals = calculateItemTotalsFromValues(values);
  const ncmSnapshot = await getNcmSnapshot(adminSupabase, values.ncm);
  const taxProfile = ncmSnapshot.taxProfile;

  return {
    simulation_id: values.simulationId,
    product_name: emptyToNull(values.productName),
    product_description: values.productDescription,
    hs_code: emptyToNull(values.hsCode),
    ncm: values.ncm,
    ncm_official_description: ncmSnapshot.officialDescription,
    ncm_source: ncmSnapshot.source,
    ncm_source_updated_at: ncmSnapshot.sourceUpdatedAt,
    ncm_tax_snapshot: ncmSnapshot.taxSnapshot,
    ii_rate: taxProfile?.ii_rate ?? values.iiRate ?? 0,
    ipi_rate: taxProfile?.ipi_rate ?? values.ipiRate ?? 0,
    pis_rate: taxProfile?.pis_rate ?? values.pisRate ?? 0,
    cofins_rate: taxProfile?.cofins_rate ?? values.cofinsRate ?? 0,
    internal_consumption: Boolean(values.internalConsumption),
    fiscal_exception: emptyToNull(values.fiscalException),
    reduced_base_rate: values.reducedBaseRate ?? 0,
    unit: emptyToNull(values.unit),
    quantity: values.quantity,
    unit_price: values.unitPrice,
    currency: values.currency || "USD",
    total_price: totals.totalPrice,
    unit_net_weight: values.unitNetWeight,
    unit_gross_weight: values.unitGrossWeight,
    total_net_weight: totals.totalNetWeight,
    total_gross_weight: totals.totalGrossWeight,
    fob_total: totals.totalPrice,
    total_cost: totals.totalPrice
  };
}

async function recalculateSimulationBasicTotals(adminSupabase: ReturnType<typeof createAdminClient>, simulationId: string) {
  const { data, error } = await adminSupabase
    .from("final_simulation_items")
    .select("total_price, total_net_weight, total_gross_weight")
    .eq("simulation_id", simulationId);

  if (error) {
    return { error };
  }

  const totals = calculateSimulationBasicTotals((data ?? []) as FinalSimulationItemRow[]);
  const { error: updateError } = await adminSupabase
    .from("final_simulations")
    .update({
      total_products_usd: totals.totalProductsUsd,
      gross_weight: totals.grossWeight,
      net_weight: totals.netWeight,
      calculation_snapshot: {
        formula_version: "basic-v1",
        scope: "basic_totals",
        total_products_usd: totals.totalProductsUsd,
        gross_weight: totals.grossWeight,
        net_weight: totals.netWeight
      }
    })
    .eq("id", simulationId);

  return { error: updateError, totals };
}

async function recalculateSimulationExpensesTotal(adminSupabase: ReturnType<typeof createAdminClient>, simulationId: string) {
  const { data, error } = await adminSupabase
    .from("simulation_expense_lines")
    .select("amount_brl")
    .eq("simulation_id", simulationId);

  if (error) {
    return { error };
  }

  const totalExpensesBrl = calculateSimulationExpensesTotal(data ?? []);
  const { error: updateError } = await adminSupabase
    .from("final_simulations")
    .update({
      total_expenses_brl: totalExpensesBrl
    })
    .eq("id", simulationId);

  return { error: updateError, totalExpensesBrl };
}

function buildTaxLineRows(
  simulationId: string,
  preview: ReturnType<typeof calculateFinalSimulationTaxPreview>,
  input: NonNullable<Awaited<ReturnType<typeof getFinalSimulationTaxPreviewInput>>>
) {
  const inputItemsById = new Map(input.items.map((item) => [item.itemId, item]));

  return preview.items.flatMap((item) => {
    const inputItem = inputItemsById.get(item.item_id);
    const ipiBaseBrl = item.customs_base_brl + item.ii_brl;
    const icmsBaseBrl = item.customs_base_brl + item.ii_brl + item.ipi_brl + item.pis_brl + item.cofins_brl;
    const formulaSnapshot = {
      formula_version: "tax-preview-v1",
      item_id: item.item_id,
      description: item.description,
      fob_brl: item.fob_brl,
      expense_allocation_brl: item.expense_allocation_brl,
      customs_base_brl: item.customs_base_brl,
      gross_taxes_brl: item.gross_taxes_brl,
      tax_credits_brl: item.tax_credits_brl,
      net_taxes_brl: item.net_taxes_brl,
      estimated_total_cost_brl: item.estimated_total_cost_brl
    };

    return [
      {
        simulation_id: simulationId,
        item_id: item.item_id,
        tax_type: "II",
        base_amount_brl: item.customs_base_brl,
        rate_percent: inputItem?.iiRate ?? 0,
        amount_brl: item.ii_brl,
        formula_snapshot: {
          ...formulaSnapshot,
          calculation: "customs_base_brl * ii_rate / 100"
        },
        is_manual_adjustment: false
      },
      {
        simulation_id: simulationId,
        item_id: item.item_id,
        tax_type: "IPI",
        base_amount_brl: ipiBaseBrl,
        rate_percent: inputItem?.ipiRate ?? 0,
        amount_brl: item.ipi_brl,
        formula_snapshot: {
          ...formulaSnapshot,
          ipi_base_brl: ipiBaseBrl,
          calculation: "(customs_base_brl + ii_brl) * ipi_rate / 100"
        },
        is_manual_adjustment: false
      },
      {
        simulation_id: simulationId,
        item_id: item.item_id,
        tax_type: "PIS_IMPORTACAO",
        base_amount_brl: item.customs_base_brl,
        rate_percent: inputItem?.pisRate ?? 0,
        amount_brl: item.pis_brl,
        formula_snapshot: {
          ...formulaSnapshot,
          calculation: "customs_base_brl * pis_rate / 100"
        },
        is_manual_adjustment: false
      },
      {
        simulation_id: simulationId,
        item_id: item.item_id,
        tax_type: "COFINS_IMPORTACAO",
        base_amount_brl: item.customs_base_brl,
        rate_percent: inputItem?.cofinsRate ?? 0,
        amount_brl: item.cofins_brl,
        formula_snapshot: {
          ...formulaSnapshot,
          calculation: "customs_base_brl * cofins_rate / 100"
        },
        is_manual_adjustment: false
      },
      {
        simulation_id: simulationId,
        item_id: item.item_id,
        tax_type: "ICMS",
        base_amount_brl: icmsBaseBrl,
        rate_percent: inputItem?.icmsRate ?? 0,
        amount_brl: item.icms_brl,
        formula_snapshot: {
          ...formulaSnapshot,
          icms_base_brl: icmsBaseBrl,
          calculation: "(customs_base_brl + ii_brl + ipi_brl + pis_brl + cofins_brl) * icms_rate / 100"
        },
        is_manual_adjustment: false
      }
    ];
  });
}

function hasCriticalTaxPreviewWarnings(preview: ReturnType<typeof calculateFinalSimulationTaxPreview>) {
  const criticalCodes = new Set(["exchange_rate_invalid", "missing_items", "zero_total_fob"]);
  return preview.warnings.some((warning) => criticalCodes.has(warning.code));
}

function getExpenseBehaviorForImportModality(
  expenseType: ExpenseType,
  importModality: FinalSimulationRow["import_modality"]
) {
  if (importModality === "propria") {
    return expenseType.own_import_behavior;
  }

  if (importModality === "conta_e_ordem") {
    return expenseType.order_account_behavior;
  }

  if (importModality === "encomenda") {
    return expenseType.encomenda_behavior;
  }

  return "not_applicable";
}

function buildExpenseTypeSnapshot(expenseType: ExpenseType) {
  return {
    id: expenseType.id,
    code: expenseType.code,
    description: expenseType.description,
    key: expenseType.key,
    expense_modality: expenseType.expense_modality,
    allocation_type: expenseType.allocation_type,
    expense_calculation_type: expenseType.expense_calculation_type,
    own_import_behavior: expenseType.own_import_behavior,
    order_account_behavior: expenseType.order_account_behavior,
    encomenda_behavior: expenseType.encomenda_behavior,
    expense_group_id: expenseType.expense_group_id,
    expense_group_name: expenseType.expense_group_name,
    erp_key: expenseType.erp_key
  };
}

function buildManualExpensePayload(values: SimulationExpenseLineValues, appUserId: string) {
  const appliedBehavior = emptyToNull(values.appliedBehavior) as ExpenseBehavior | null;

  return {
    expense_code: emptyToNull(values.expenseCode),
    expense_name: values.expenseName,
    expense_category: emptyToNull(values.expenseCategory),
    description: emptyToNull(values.description),
    currency: values.currency || "BRL",
    amount_brl: values.amountBrl ?? 0,
    amount_usd: values.amountUsd ?? 0,
    calculation_type: emptyToNull(values.calculationType),
    allocation_type: emptyToNull(values.allocationType),
    applied_behavior: appliedBehavior,
    applied_behavior_label: appliedBehavior ? expenseBehaviorLabels[appliedBehavior] : null,
    notes: emptyToNull(values.notes),
    updated_by: appUserId
  };
}

async function getEditableExpenseLine(
  adminSupabase: ReturnType<typeof createAdminClient>,
  simulationId: string,
  expenseLineId: string
) {
  const { data, error } = await adminSupabase
    .from("simulation_expense_lines")
    .select("id, is_manual, is_editable")
    .eq("id", expenseLineId)
    .eq("simulation_id", simulationId)
    .maybeSingle();

  if (error || !data) {
    return {
      error: "Despesa não encontrada.",
      expenseLine: null
    };
  }

  const expenseLine = data as Pick<SimulationExpenseLine, "id" | "is_manual" | "is_editable">;

  if (!expenseLine.is_manual && !expenseLine.is_editable) {
    return {
      error: "Esta despesa foi gerada por pré-cálculo e não permite edição.",
      expenseLine: null
    };
  }

  return {
    error: null,
    expenseLine
  };
}

export async function createFinalSimulationAction(
  _previousState: FinalSimulationActionState<FinalSimulationMainDataValues>,
  formData: FormData
): Promise<FinalSimulationActionState<FinalSimulationMainDataValues>> {
  const adminUser = await requireAdminUser();
  const parsed = createFinalSimulationSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const customer = await findCustomerSnapshot(adminSupabase, parsed.data.customerId);

  if (customer.error) {
    return buildActionError<FinalSimulationMainDataValues>(parsed.data, { customerId: customer.error });
  }

  const { data, error } = await adminSupabase
    .from("final_simulations")
    .insert({
      ...buildMainDataPayload(parsed.data, adminUser.id, customer.customerName),
      status: "draft",
      created_by: adminUser.id,
      updated_by: adminUser.id
    })
    .select("id")
    .single();

  if (error || !data) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  revalidateFinalSimulationPaths(data.id);

  return {
    success: true,
    message: "Simulação final criada.",
    id: data.id
  };
}

export async function updateFinalSimulationMainDataAction(
  _previousState: FinalSimulationActionState<FinalSimulationMainDataValues>,
  formData: FormData
): Promise<FinalSimulationActionState<FinalSimulationMainDataValues>> {
  const adminUser = await requireAdminUser();
  const parsed = updateFinalSimulationMainDataSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const editable = await getEditableSimulation(adminSupabase, parsed.data.simulationId ?? "");

  if (editable.error || !editable.simulation) {
    return buildActionError(parsed.data, { form: editable.error ?? unexpectedSaveMessage });
  }

  const customer = await findCustomerSnapshot(adminSupabase, parsed.data.customerId);

  if (customer.error) {
    return buildActionError<FinalSimulationMainDataValues>(parsed.data, { customerId: customer.error });
  }

  const { error } = await adminSupabase
    .from("final_simulations")
    .update(buildMainDataPayload(parsed.data, adminUser.id, customer.customerName))
    .eq("id", editable.simulation.id);

  if (error) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  revalidateFinalSimulationPaths(editable.simulation.id);

  return {
    success: true,
    message: "Dados principais atualizados.",
    id: editable.simulation.id
  };
}

export async function addFinalSimulationItemAction(
  _previousState: FinalSimulationActionState<FinalSimulationItemValues>,
  formData: FormData
): Promise<FinalSimulationActionState<FinalSimulationItemValues>> {
  await requireAdminUser();
  const parsed = finalSimulationItemSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const editable = await getEditableSimulation(adminSupabase, parsed.data.simulationId);

  if (editable.error || !editable.simulation) {
    return buildActionError(parsed.data, { form: editable.error ?? unexpectedSaveMessage });
  }

  const payload = await buildItemPayload(adminSupabase, parsed.data);
  const { data, error } = await adminSupabase
    .from("final_simulation_items")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  await recalculateSimulationBasicTotals(adminSupabase, parsed.data.simulationId);
  revalidateFinalSimulationPaths(parsed.data.simulationId);

  return {
    success: true,
    message: "Item adicionado.",
    id: data.id
  };
}

export async function updateFinalSimulationItemAction(
  _previousState: FinalSimulationActionState<FinalSimulationItemValues>,
  formData: FormData
): Promise<FinalSimulationActionState<FinalSimulationItemValues>> {
  await requireAdminUser();
  const parsed = updateFinalSimulationItemSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const editable = await getEditableSimulation(adminSupabase, parsed.data.simulationId);

  if (editable.error || !editable.simulation) {
    return buildActionError(parsed.data, { form: editable.error ?? unexpectedSaveMessage });
  }

  const payload = await buildItemPayload(adminSupabase, parsed.data);
  const { error } = await adminSupabase
    .from("final_simulation_items")
    .update(payload)
    .eq("id", parsed.data.itemId)
    .eq("simulation_id", parsed.data.simulationId);

  if (error) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  await recalculateSimulationBasicTotals(adminSupabase, parsed.data.simulationId);
  revalidateFinalSimulationPaths(parsed.data.simulationId);

  return {
    success: true,
    message: "Item atualizado.",
    id: parsed.data.itemId
  };
}

export async function deleteFinalSimulationItemAction(formData: FormData) {
  await requireAdminUser();
  const simulationId = String(formData.get("simulationId") ?? "").trim();
  const itemId = String(formData.get("itemId") ?? "").trim();

  if (!simulationId || !itemId) {
    return {
      success: false,
      message: "Informe a simulação e o item."
    };
  }

  const adminSupabase = createAdminClient();
  const editable = await getEditableSimulation(adminSupabase, simulationId);

  if (editable.error || !editable.simulation) {
    return {
      success: false,
      message: editable.error ?? unexpectedSaveMessage
    };
  }

  const { error } = await adminSupabase
    .from("final_simulation_items")
    .delete()
    .eq("id", itemId)
    .eq("simulation_id", simulationId);

  if (error) {
    return {
      success: false,
      message: unexpectedSaveMessage
    };
  }

  await recalculateSimulationBasicTotals(adminSupabase, simulationId);
  revalidateFinalSimulationPaths(simulationId);

  return {
    success: true,
    message: "Item removido."
  };
}

export async function recalculateFinalSimulationBasicTotalsAction(formData: FormData) {
  await requireAdminUser();
  const simulationId = String(formData.get("simulationId") ?? "").trim();

  if (!simulationId) {
    return {
      success: false,
      message: "Informe a simulação."
    };
  }

  const adminSupabase = createAdminClient();
  const editable = await getEditableSimulation(adminSupabase, simulationId);

  if (editable.error || !editable.simulation) {
    return {
      success: false,
      message: editable.error ?? unexpectedSaveMessage
    };
  }

  const { error, totals } = await recalculateSimulationBasicTotals(adminSupabase, simulationId);

  if (error) {
    return {
      success: false,
      message: unexpectedSaveMessage
    };
  }

  revalidateFinalSimulationPaths(simulationId);

  return {
    success: true,
    message: "Totais básicos recalculados.",
    totals
  };
}

export async function recalculateFinalSimulationTaxesAction(formData: FormData) {
  const adminUser = await requireAdminUser();
  const simulationId = String(formData.get("simulationId") ?? "").trim();

  if (!simulationId) {
    return {
      success: false,
      message: "Informe a simulação."
    };
  }

  const adminSupabase = createAdminClient();
  const editable = await getEditableSimulation(adminSupabase, simulationId);

  if (editable.error || !editable.simulation) {
    return {
      success: false,
      message: editable.error ?? unexpectedSaveMessage
    };
  }

  const input = await getFinalSimulationTaxPreviewInput(simulationId);

  if (!input) {
    return {
      success: false,
      message: "Simulação final não encontrada."
    };
  }

  const preview = calculateFinalSimulationTaxPreview(input);

  if (hasCriticalTaxPreviewWarnings(preview)) {
    return {
      success: false,
      message: "Não foi possível recalcular impostos. Revise produtos, FOB e câmbio antes de continuar.",
      preview
    };
  }

  const taxLineRows = buildTaxLineRows(simulationId, preview, input);
  const { error: deleteError } = await adminSupabase
    .from("simulation_tax_lines")
    .delete()
    .eq("simulation_id", simulationId)
    .eq("is_manual_adjustment", false);

  if (deleteError) {
    return {
      success: false,
      message: unexpectedSaveMessage
    };
  }

  if (taxLineRows.length > 0) {
    const { error: insertError } = await adminSupabase.from("simulation_tax_lines").insert(taxLineRows);

    if (insertError) {
      return {
        success: false,
        message: unexpectedSaveMessage
      };
    }
  }

  const { error: updateError } = await adminSupabase
    .from("final_simulations")
    .update({
      customs_value_brl: preview.totals.total_customs_base_brl,
      total_taxes_brl: preview.totals.net_taxes_brl,
      total_cost_brl: preview.totals.estimated_total_cost_brl,
      calculation_snapshot: {
        formula_version: "tax-preview-v1",
        scope: "tax_recalculation",
        calculated_at: new Date().toISOString(),
        totals: preview.totals,
        warnings: preview.warnings,
        meta: preview.meta,
        persisted_tax_lines_count: taxLineRows.length
      },
      updated_by: adminUser.id
    })
    .eq("id", simulationId);

  if (updateError) {
    return {
      success: false,
      message: unexpectedSaveMessage
    };
  }

  revalidateFinalSimulationPaths(simulationId);

  return {
    success: true,
    message: "Impostos V1 recalculados.",
    preview
  };
}

export async function generateFinalSimulationDocumentSnapshotsAction(
  _previousState: { success: boolean; message?: string; generatedAt?: string },
  formData: FormData
) {
  const adminUser = await requireAdminUser();
  const simulationId = String(formData.get("simulationId") ?? "").trim();

  if (!simulationId) {
    return {
      success: false,
      message: "Informe a simulação."
    };
  }

  const report = await buildFinalSimulationClientReportData(simulationId);

  if (!report) {
    return {
      success: false,
      message: "Simulação final não encontrada."
    };
  }

  if (!report.meta.hasSavedCalculation) {
    return {
      success: false,
      message: "Recalcule os impostos antes de gerar os snapshots dos documentos."
    };
  }

  const generatedAt = new Date().toISOString();
  const metadata = {
    generatedAt,
    generatedBy: adminUser.id
  };
  const publicSnapshot = buildFinalSimulationPublicSnapshot(report, metadata);
  const internalSnapshot = buildFinalSimulationInternalSnapshot(report, metadata);
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("final_simulations")
    .update({
      public_snapshot: publicSnapshot,
      internal_snapshot: internalSnapshot,
      updated_by: adminUser.id
    })
    .eq("id", simulationId);

  if (error) {
    return {
      success: false,
      message: unexpectedSaveMessage
    };
  }

  revalidateFinalSimulationPaths(simulationId);

  return {
    success: true,
    message: "Snapshots dos documentos gerados.",
    generatedAt
  };
}

export async function processExpensePresetForSimulationAction(
  _previousState: FinalSimulationActionState<ProcessExpensePresetValues>,
  formData: FormData
): Promise<FinalSimulationActionState<ProcessExpensePresetValues>> {
  const adminUser = await requireAdminUser();
  const parsed = processExpensePresetSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const editable = await getEditableSimulation(adminSupabase, parsed.data.simulationId);

  if (editable.error || !editable.simulation) {
    return buildActionError(parsed.data, { form: editable.error ?? unexpectedSaveMessage });
  }

  const [{ data: preset }, { data: presetItems }] = await Promise.all([
    adminSupabase
      .from("expense_presets")
      .select("*")
      .eq("id", parsed.data.presetId)
      .eq("is_active", true)
      .maybeSingle(),
    adminSupabase
      .from("expense_preset_items")
      .select("*")
      .eq("preset_id", parsed.data.presetId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
  ]);

  if (!preset) {
    return buildActionError<ProcessExpensePresetValues>(parsed.data, {
      presetId: "Pré-cálculo ativo não encontrado."
    });
  }

  const items = (presetItems ?? []) as ExpensePresetItem[];

  if (items.length === 0) {
    return buildActionError<ProcessExpensePresetValues>(parsed.data, {
      presetId: "Este pré-cálculo não possui itens."
    });
  }

  const expenseTypeIds = [...new Set(items.map((item) => item.expense_type_id))];
  const { data: expenseTypes, error: expenseTypesError } = await adminSupabase
    .from("expense_types")
    .select("*")
    .in("id", expenseTypeIds);

  if (expenseTypesError) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  const expenseTypesById = new Map((expenseTypes ?? []).map((expenseType) => [expenseType.id, expenseType as ExpenseType]));
  const payload = [];

  for (const item of items) {
    const expenseType = expenseTypesById.get(item.expense_type_id);

    if (!expenseType) {
      return buildActionError<ProcessExpensePresetValues>(parsed.data, {
        presetId: "O pré-cálculo possui item com tipo de despesa inválido."
      });
    }

    const appliedBehavior =
      item.override_behavior ?? getExpenseBehaviorForImportModality(expenseType, editable.simulation.import_modality);

    if (appliedBehavior === "not_applicable") {
      continue;
    }

    payload.push({
      simulation_id: editable.simulation.id,
      source_preset_id: parsed.data.presetId,
      source_preset_item_id: item.id,
      expense_type_id: expenseType.id,
      expense_code: item.expense_code_snapshot ?? expenseType.code,
      expense_name: item.expense_description_snapshot ?? expenseType.description,
      expense_category: expenseType.expense_modality,
      description: item.notes,
      currency: item.default_currency || "BRL",
      amount_brl: item.default_amount_brl ?? 0,
      amount_usd: item.default_amount_usd ?? 0,
      calculation_type: item.override_calculation_type ?? expenseType.expense_calculation_type,
      allocation_type: item.override_allocation_type ?? expenseType.allocation_type,
      allocation_snapshot: {},
      applied_import_modality: editable.simulation.import_modality,
      applied_behavior: appliedBehavior,
      applied_behavior_label: expenseBehaviorLabels[appliedBehavior],
      expense_type_snapshot: buildExpenseTypeSnapshot(expenseType),
      is_from_preset: true,
      is_manual: false,
      is_editable: item.is_editable,
      sort_order: item.sort_order ?? 0,
      notes: item.notes,
      created_by: adminUser.id,
      updated_by: adminUser.id
    });
  }

  const { error: deleteError } = await adminSupabase
    .from("simulation_expense_lines")
    .delete()
    .eq("simulation_id", editable.simulation.id)
    .eq("source_preset_id", parsed.data.presetId)
    .eq("is_from_preset", true);

  if (deleteError) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  if (payload.length > 0) {
    const { error: insertError } = await adminSupabase.from("simulation_expense_lines").insert(payload);

    if (insertError) {
      return buildActionError(parsed.data, {}, unexpectedSaveMessage);
    }
  }

  const { error: totalError } = await recalculateSimulationExpensesTotal(adminSupabase, editable.simulation.id);

  if (totalError) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  revalidateFinalSimulationPaths(editable.simulation.id);

  return {
    success: true,
    message:
      payload.length > 0
        ? "Pré-cálculo processado para a simulação."
        : "Pré-cálculo processado, mas nenhuma despesa se aplica a esta modalidade.",
    id: editable.simulation.id
  };
}

export async function addManualSimulationExpenseAction(
  _previousState: FinalSimulationActionState<SimulationExpenseLineValues>,
  formData: FormData
): Promise<FinalSimulationActionState<SimulationExpenseLineValues>> {
  const adminUser = await requireAdminUser();
  const parsed = manualSimulationExpenseSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const editable = await getEditableSimulation(adminSupabase, parsed.data.simulationId);

  if (editable.error || !editable.simulation) {
    return buildActionError(parsed.data, { form: editable.error ?? unexpectedSaveMessage });
  }

  const { data, error } = await adminSupabase
    .from("simulation_expense_lines")
    .insert({
      ...buildManualExpensePayload(parsed.data, adminUser.id),
      simulation_id: editable.simulation.id,
      applied_import_modality: editable.simulation.import_modality,
      expense_type_snapshot: {},
      allocation_snapshot: {},
      is_from_preset: false,
      is_manual: true,
      is_editable: true,
      created_by: adminUser.id,
      updated_by: adminUser.id
    })
    .select("id")
    .single();

  if (error || !data) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  const { error: totalError } = await recalculateSimulationExpensesTotal(adminSupabase, editable.simulation.id);

  if (totalError) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  revalidateFinalSimulationPaths(editable.simulation.id);

  return {
    success: true,
    message: "Despesa manual adicionada.",
    id: data.id
  };
}

export async function updateSimulationExpenseLineAction(
  _previousState: FinalSimulationActionState<SimulationExpenseLineValues>,
  formData: FormData
): Promise<FinalSimulationActionState<SimulationExpenseLineValues>> {
  const adminUser = await requireAdminUser();
  const parsed = updateSimulationExpenseLineSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const editable = await getEditableSimulation(adminSupabase, parsed.data.simulationId);

  if (editable.error || !editable.simulation) {
    return buildActionError(parsed.data, { form: editable.error ?? unexpectedSaveMessage });
  }

  const expenseLine = await getEditableExpenseLine(
    adminSupabase,
    parsed.data.simulationId,
    parsed.data.expenseLineId ?? ""
  );

  if (expenseLine.error || !expenseLine.expenseLine) {
    return buildActionError(parsed.data, { form: expenseLine.error ?? unexpectedSaveMessage });
  }

  const { error } = await adminSupabase
    .from("simulation_expense_lines")
    .update(buildManualExpensePayload(parsed.data, adminUser.id))
    .eq("id", parsed.data.expenseLineId)
    .eq("simulation_id", parsed.data.simulationId);

  if (error) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  const { error: totalError } = await recalculateSimulationExpensesTotal(adminSupabase, parsed.data.simulationId);

  if (totalError) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  revalidateFinalSimulationPaths(parsed.data.simulationId);

  return {
    success: true,
    message: "Despesa atualizada.",
    id: parsed.data.expenseLineId
  };
}

export async function deleteSimulationExpenseLineAction(formData: FormData) {
  await requireAdminUser();
  const simulationId = String(formData.get("simulationId") ?? "").trim();
  const expenseLineId = String(formData.get("expenseLineId") ?? "").trim();

  if (!simulationId || !expenseLineId) {
    return {
      success: false,
      message: "Informe a simulação e a despesa."
    };
  }

  const adminSupabase = createAdminClient();
  const editable = await getEditableSimulation(adminSupabase, simulationId);

  if (editable.error || !editable.simulation) {
    return {
      success: false,
      message: editable.error ?? unexpectedSaveMessage
    };
  }

  const expenseLine = await getEditableExpenseLine(adminSupabase, simulationId, expenseLineId);

  if (expenseLine.error || !expenseLine.expenseLine) {
    return {
      success: false,
      message: expenseLine.error ?? unexpectedSaveMessage
    };
  }

  const { error } = await adminSupabase
    .from("simulation_expense_lines")
    .delete()
    .eq("id", expenseLineId)
    .eq("simulation_id", simulationId);

  if (error) {
    return {
      success: false,
      message: unexpectedSaveMessage
    };
  }

  await recalculateSimulationExpensesTotal(adminSupabase, simulationId);
  revalidateFinalSimulationPaths(simulationId);

  return {
    success: true,
    message: "Despesa removida."
  };
}

export async function createExpenseTypeAction(
  _previousState: FinalSimulationActionState<ExpenseTypeValues>,
  formData: FormData
): Promise<FinalSimulationActionState<ExpenseTypeValues>> {
  const adminUser = await requireAdminUser();
  const parsed = createExpenseTypeSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("expense_types")
    .insert({
      ...buildExpenseTypePayload(parsed.data, adminUser.id),
      created_by: adminUser.id,
      updated_by: adminUser.id
    })
    .select("id")
    .single();

  if (error || !data) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  revalidateExpenseMasterPaths();

  return {
    success: true,
    message: "Tipo de despesa criado.",
    id: data.id
  };
}

export async function updateExpenseTypeAction(
  _previousState: FinalSimulationActionState<ExpenseTypeValues>,
  formData: FormData
): Promise<FinalSimulationActionState<ExpenseTypeValues>> {
  const adminUser = await requireAdminUser();
  const parsed = updateExpenseTypeSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("expense_types")
    .update(buildExpenseTypePayload(parsed.data, adminUser.id))
    .eq("id", parsed.data.expenseTypeId);

  if (error) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  revalidateExpenseMasterPaths();

  return {
    success: true,
    message: "Tipo de despesa atualizado.",
    id: parsed.data.expenseTypeId
  };
}

export async function archiveOrDeactivateExpenseTypeAction(formData: FormData) {
  const adminUser = await requireAdminUser();
  const expenseTypeId = String(formData.get("expenseTypeId") ?? "").trim();

  if (!expenseTypeId) {
    return {
      success: false,
      message: "Informe o tipo de despesa."
    };
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("expense_types")
    .update({
      is_active: false,
      updated_by: adminUser.id
    })
    .eq("id", expenseTypeId);

  if (error) {
    return {
      success: false,
      message: unexpectedSaveMessage
    };
  }

  revalidateExpenseMasterPaths();

  return {
    success: true,
    message: "Tipo de despesa desativado."
  };
}

export async function createExpensePresetAction(
  _previousState: FinalSimulationActionState<ExpensePresetValues>,
  formData: FormData
): Promise<FinalSimulationActionState<ExpensePresetValues>> {
  const adminUser = await requireAdminUser();
  const parsed = createExpensePresetSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("expense_presets")
    .insert({
      ...buildExpensePresetPayload(parsed.data, adminUser.id),
      created_by: adminUser.id,
      updated_by: adminUser.id
    })
    .select("id")
    .single();

  if (error || !data) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  revalidateExpenseMasterPaths();

  return {
    success: true,
    message: "Pré-cálculo criado.",
    id: data.id
  };
}

export async function updateExpensePresetAction(
  _previousState: FinalSimulationActionState<ExpensePresetValues>,
  formData: FormData
): Promise<FinalSimulationActionState<ExpensePresetValues>> {
  const adminUser = await requireAdminUser();
  const parsed = updateExpensePresetSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("expense_presets")
    .update(buildExpensePresetPayload(parsed.data, adminUser.id))
    .eq("id", parsed.data.expensePresetId);

  if (error) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  revalidateExpenseMasterPaths();

  return {
    success: true,
    message: "Pré-cálculo atualizado.",
    id: parsed.data.expensePresetId
  };
}

export async function archiveOrDeactivateExpensePresetAction(formData: FormData) {
  const adminUser = await requireAdminUser();
  const expensePresetId = String(formData.get("expensePresetId") ?? "").trim();

  if (!expensePresetId) {
    return {
      success: false,
      message: "Informe o pré-cálculo."
    };
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("expense_presets")
    .update({
      is_active: false,
      updated_by: adminUser.id
    })
    .eq("id", expensePresetId);

  if (error) {
    return {
      success: false,
      message: unexpectedSaveMessage
    };
  }

  revalidateExpenseMasterPaths();

  return {
    success: true,
    message: "Pré-cálculo desativado."
  };
}

export async function addExpensePresetItemAction(
  _previousState: FinalSimulationActionState<ExpensePresetItemValues>,
  formData: FormData
): Promise<FinalSimulationActionState<ExpensePresetItemValues>> {
  const adminUser = await requireAdminUser();
  const parsed = createExpensePresetItemSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const built = await buildExpensePresetItemPayload(adminSupabase, parsed.data, adminUser.id);

  if (built.error || !built.payload) {
    return buildActionError<ExpensePresetItemValues>(parsed.data, { expenseTypeId: built.error ?? unexpectedSaveMessage });
  }

  const { data, error } = await adminSupabase
    .from("expense_preset_items")
    .insert({
      ...built.payload,
      created_by: adminUser.id,
      updated_by: adminUser.id
    })
    .select("id")
    .single();

  if (error || !data) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  revalidateExpenseMasterPaths();

  return {
    success: true,
    message: "Item do pré-cálculo adicionado.",
    id: data.id
  };
}

export async function updateExpensePresetItemAction(
  _previousState: FinalSimulationActionState<ExpensePresetItemValues>,
  formData: FormData
): Promise<FinalSimulationActionState<ExpensePresetItemValues>> {
  const adminUser = await requireAdminUser();
  const parsed = updateExpensePresetItemSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const built = await buildExpensePresetItemPayload(adminSupabase, parsed.data, adminUser.id);

  if (built.error || !built.payload) {
    return buildActionError<ExpensePresetItemValues>(parsed.data, { expenseTypeId: built.error ?? unexpectedSaveMessage });
  }

  const { error } = await adminSupabase
    .from("expense_preset_items")
    .update(built.payload)
    .eq("id", parsed.data.expensePresetItemId)
    .eq("preset_id", parsed.data.presetId);

  if (error) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  revalidateExpenseMasterPaths();

  return {
    success: true,
    message: "Item do pré-cálculo atualizado.",
    id: parsed.data.expensePresetItemId
  };
}

export async function deleteExpensePresetItemAction(formData: FormData) {
  await requireAdminUser();
  const expensePresetItemId = String(formData.get("expensePresetItemId") ?? "").trim();
  const presetId = String(formData.get("presetId") ?? "").trim();

  if (!expensePresetItemId || !presetId) {
    return {
      success: false,
      message: "Informe o pré-cálculo e o item."
    };
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("expense_preset_items")
    .delete()
    .eq("id", expensePresetItemId)
    .eq("preset_id", presetId);

  if (error) {
    return {
      success: false,
      message: unexpectedSaveMessage
    };
  }

  revalidateExpenseMasterPaths();

  return {
    success: true,
    message: "Item do pré-cálculo removido."
  };
}

export async function createInvoiceParametrizationAction(
  _previousState: FinalSimulationActionState<InvoiceParametrizationFormInput>,
  formData: FormData
): Promise<FinalSimulationActionState<InvoiceParametrizationFormInput>> {
  const adminUser = await requireAdminUser();
  const parsed = invoiceParametrizationSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("invoice_parametrizations")
    .insert({
      ...buildInvoiceParametrizationPayload(parsed.data, adminUser.id),
      created_by: adminUser.id,
      updated_by: adminUser.id
    })
    .select("id")
    .single();

  if (error || !data) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  revalidateExpenseMasterPaths();

  return {
    success: true,
    message: "Parametrização fiscal criada.",
    id: data.id
  };
}

export async function updateInvoiceParametrizationAction(
  _previousState: FinalSimulationActionState<InvoiceParametrizationFormInput>,
  formData: FormData
): Promise<FinalSimulationActionState<InvoiceParametrizationFormInput>> {
  const adminUser = await requireAdminUser();
  const parsed = updateInvoiceParametrizationSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("invoice_parametrizations")
    .update(buildInvoiceParametrizationPayload(parsed.data, adminUser.id))
    .eq("id", parsed.data.invoiceParametrizationId);

  if (error) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  revalidateExpenseMasterPaths();

  return {
    success: true,
    message: "Parametrização fiscal atualizada.",
    id: parsed.data.invoiceParametrizationId
  };
}

export async function toggleInvoiceParametrizationStatusAction(formData: FormData) {
  const adminUser = await requireAdminUser();
  const invoiceParametrizationId = String(formData.get("invoiceParametrizationId") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "").trim() === "true";

  if (!invoiceParametrizationId) {
    return {
      success: false,
      message: "Informe a parametrização fiscal."
    };
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("invoice_parametrizations")
    .update({
      is_active: isActive,
      updated_by: adminUser.id
    })
    .eq("id", invoiceParametrizationId);

  if (error) {
    return {
      success: false,
      message: unexpectedSaveMessage
    };
  }

  revalidateExpenseMasterPaths();

  return {
    success: true,
    message: isActive ? "Parametrização fiscal ativada." : "Parametrização fiscal desativada."
  };
}

export async function deleteInvoiceParametrizationAction(formData: FormData) {
  const adminUser = await requireAdminUser();
  const invoiceParametrizationId = String(formData.get("invoiceParametrizationId") ?? "").trim();

  if (!invoiceParametrizationId) {
    return {
      success: false,
      message: "Informe a parametrização fiscal."
    };
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("invoice_parametrizations")
    .update({
      is_active: false,
      updated_by: adminUser.id
    })
    .eq("id", invoiceParametrizationId);

  if (error) {
    return {
      success: false,
      message: unexpectedSaveMessage
    };
  }

  revalidateExpenseMasterPaths();

  return {
    success: true,
    message: "Parametrização fiscal desativada."
  };
}

export async function updateFinalSimulationFiscalSettingsAction(
  _previousState: FinalSimulationActionState<FinalSimulationFiscalSettingsInput>,
  formData: FormData
): Promise<FinalSimulationActionState<FinalSimulationFiscalSettingsInput>> {
  const adminUser = await requireAdminUser();
  const parsed = finalSimulationFiscalSettingsSchema.parse(formData);

  if (!parsed.success) {
    return buildActionError(parsed.values, parsed.fieldErrors);
  }

  const adminSupabase = createAdminClient();
  const editable = await getEditableSimulation(adminSupabase, parsed.data.simulationId);

  if (editable.error || !editable.simulation) {
    return buildActionError(parsed.data, { form: editable.error ?? unexpectedSaveMessage });
  }

  const entryInvoiceParametrizationId = parsed.data.entryInvoiceParametrizationId || null;
  const exitInvoiceParametrizationId = parsed.data.exitInvoiceParametrizationId || null;
  const tradeCommissionMode = parsed.data.tradeCommissionMode || "none";
  const tradeCommissionPercent = tradeCommissionMode === "percent" ? parsed.data.tradeCommissionPercent ?? 0 : 0;
  const tradeCommissionAmountBrl =
    tradeCommissionMode === "fixed_expense" ? parsed.data.tradeCommissionAmountBrl ?? 0 : 0;
  let entryInvoiceParametrizationSnapshot: Record<string, unknown> = {};
  let exitInvoiceParametrizationSnapshot: Record<string, unknown> = {};

  if (entryInvoiceParametrizationId) {
    const entry = await findActiveInvoiceParametrization(adminSupabase, entryInvoiceParametrizationId, "entrada");

    if (entry.error || !entry.invoiceParametrization) {
      return buildActionError<FinalSimulationFiscalSettingsInput>(parsed.data, {
        entryInvoiceParametrizationId: entry.error ?? unexpectedSaveMessage
      });
    }

    entryInvoiceParametrizationSnapshot = buildInvoiceParametrizationSnapshot(entry.invoiceParametrization);
  }

  if (exitInvoiceParametrizationId) {
    const exit = await findActiveInvoiceParametrization(adminSupabase, exitInvoiceParametrizationId, "saida");

    if (exit.error || !exit.invoiceParametrization) {
      return buildActionError<FinalSimulationFiscalSettingsInput>(parsed.data, {
        exitInvoiceParametrizationId: exit.error ?? unexpectedSaveMessage
      });
    }

    exitInvoiceParametrizationSnapshot = buildInvoiceParametrizationSnapshot(exit.invoiceParametrization);
  }

  const { error } = await adminSupabase
    .from("final_simulations")
    .update({
      trade_commission_mode: tradeCommissionMode,
      trade_commission_percent: tradeCommissionPercent,
      trade_commission_amount_brl: tradeCommissionAmountBrl,
      ignore_trade_commission_contract: parsed.data.ignoreTradeCommissionContract ?? false,
      credits_ipi: parsed.data.creditsIpi ?? false,
      credits_pis: parsed.data.creditsPis ?? false,
      credits_cofins: parsed.data.creditsCofins ?? false,
      credits_icms: parsed.data.creditsIcms ?? false,
      tax_credit_notes: emptyToNull(parsed.data.taxCreditNotes),
      entry_invoice_parametrization_id: entryInvoiceParametrizationId,
      entry_invoice_parametrization_snapshot: entryInvoiceParametrizationSnapshot,
      exit_invoice_parametrization_id: exitInvoiceParametrizationId,
      exit_invoice_parametrization_snapshot: exitInvoiceParametrizationSnapshot,
      updated_by: adminUser.id
    })
    .eq("id", editable.simulation.id);

  if (error) {
    return buildActionError(parsed.data, {}, unexpectedSaveMessage);
  }

  revalidateFinalSimulationPaths(editable.simulation.id);

  return {
    success: true,
    message: "Parametrização fiscal da simulação atualizada.",
    id: editable.simulation.id,
    values: {
      ...parsed.data,
      tradeCommissionMode,
      tradeCommissionPercent,
      tradeCommissionAmountBrl
    }
  };
}
