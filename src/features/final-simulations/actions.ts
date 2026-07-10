"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/get-session-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateItemTotalsFromValues,
  calculateSimulationBasicTotals
} from "./calculation-engine";
import {
  createFinalSimulationSchema,
  finalSimulationItemSchema,
  isFinalSimulationLocked,
  updateFinalSimulationItemSchema,
  updateFinalSimulationMainDataSchema
} from "./schemas";
import type {
  FinalSimulationActionState,
  FinalSimulationItemRow,
  FinalSimulationItemValues,
  FinalSimulationMainDataValues,
  FinalSimulationRow,
  NcmCodeRow
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
  }
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
    .select("id, status")
    .eq("id", simulationId)
    .maybeSingle();

  if (error || !data) {
    return {
      error: "Simulação final não encontrada.",
      simulation: null
    };
  }

  const simulation = data as Pick<FinalSimulationRow, "id" | "status">;

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

async function getNcmSnapshot(adminSupabase: ReturnType<typeof createAdminClient>, ncm: string) {
  const { data } = await adminSupabase
    .from("ncm_codes")
    .select("*")
    .eq("code", ncm)
    .eq("is_active", true)
    .maybeSingle();

  const ncmCode = (data ?? null) as NcmCodeRow | null;

  if (!ncmCode) {
    return {
      officialDescription: null,
      source: null,
      sourceUpdatedAt: null,
      taxSnapshot: {}
    };
  }

  return {
    officialDescription: ncmCode.description,
    source: ncmCode.source,
    sourceUpdatedAt: ncmCode.source_updated_at,
    taxSnapshot: {
      code: ncmCode.code,
      description: ncmCode.description,
      hierarchical_description: ncmCode.hierarchical_description,
      legal_act: ncmCode.legal_act,
      source: ncmCode.source,
      source_updated_at: ncmCode.source_updated_at
    }
  };
}

async function buildItemPayload(adminSupabase: ReturnType<typeof createAdminClient>, values: FinalSimulationItemValues) {
  const totals = calculateItemTotalsFromValues(values);
  const ncmSnapshot = await getNcmSnapshot(adminSupabase, values.ncm);

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
