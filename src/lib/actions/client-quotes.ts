"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/get-session-profile";
import { hasSupabaseConfig } from "@/lib/auth/mock-users";
import type { ClientQuotePayload, ClientQuoteRecord } from "@/lib/client/types";
import { mapQuoteRow } from "@/lib/client/quotes";
import { createClient } from "@/lib/supabase/server";

const quoteSelect = [
  "id",
  "product_name",
  "hs_code",
  "supplier_name",
  "supplier_email",
  "supplier_phone",
  "fob_unit_usd",
  "quantity",
  "fob_total_usd",
  "used_dollar",
  "rpx_factor",
  "direct_import_factor",
  "unit_cost_rpx_brl",
  "total_cost_rpx_brl",
  "unit_cost_direct_brl",
  "total_cost_direct_brl",
  "savings_brl",
  "savings_percent",
  "status",
  "product_image_urls",
  "supplier_contact_image_urls",
  "created_at",
  "simulations(id, status)"
].join(", ");

function buildQuoteMutation(payload: ClientQuotePayload, appUser: { id: string; client_id: string | null }) {
  if (!appUser.client_id) {
    throw new Error("Cliente não vinculado ao usuário.");
  }

  return {
    client_id: appUser.client_id,
    created_by_app_user_id: appUser.id,
    product_name: payload.productName.trim(),
    hs_code: payload.hsCode.trim() || null,
    supplier_name: payload.supplierName?.trim() || null,
    supplier_email: payload.supplierEmail?.trim() || null,
    supplier_phone: payload.supplierPhone?.trim() || null,
    fob_unit_usd: payload.fobUnitUsd,
    quantity: payload.quantity,
    fob_total_usd: payload.fobTotalUsd,
    used_dollar: payload.usedDollar,
    rpx_factor: payload.rpxFactor,
    direct_import_factor: payload.directImportFactor,
    unit_cost_rpx_brl: payload.unitCostRpxBrl,
    total_cost_rpx_brl: payload.totalCostRpxBrl,
    unit_cost_direct_brl: payload.unitCostDirectBrl,
    total_cost_direct_brl: payload.totalCostDirectBrl,
    savings_brl: payload.savingsBrl,
    savings_percent: payload.savingsPercent,
    product_image_urls: payload.images,
    supplier_contact_image_urls: payload.supplierContactImages,
    calculation_payload: payload,
    updated_at: new Date().toISOString()
  };
}

export async function saveClientQuoteAction(payload: ClientQuotePayload): Promise<ClientQuoteRecord> {
  const { appUser } = await requireRole("client");

  if (!hasSupabaseConfig()) {
    throw new Error("Supabase não configurado.");
  }

  const supabase = await createClient();
  const mutation = buildQuoteMutation(payload, appUser);

  const query = payload.id
    ? supabase.from("quotes").update(mutation).eq("id", payload.id).select(quoteSelect).single()
    : supabase
        .from("quotes")
        .insert({
          ...mutation,
          status: "submitted"
        })
        .select(quoteSelect)
        .single();

  const { data, error } = await query;

  if (error || !data) {
    throw new Error(error?.message ?? "Não foi possível salvar a cotação.");
  }

  revalidatePath("/app");
  revalidatePath("/app/calculadora");
  revalidatePath("/admin/cotacoes");
  revalidatePath("/admin/dashboard");

  return mapQuoteRow(data as unknown as Parameters<typeof mapQuoteRow>[0]);
}

export async function duplicateClientQuoteAction(quoteId: string): Promise<ClientQuoteRecord> {
  const { appUser } = await requireRole("client");

  if (!hasSupabaseConfig() || !appUser.client_id) {
    throw new Error("Cliente não vinculado ao usuário.");
  }

  const supabase = await createClient();
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select(
      [
        "product_name",
        "hs_code",
        "supplier_name",
        "supplier_email",
        "supplier_phone",
        "fob_unit_usd",
        "quantity",
        "fob_total_usd",
        "used_dollar",
        "rpx_factor",
        "direct_import_factor",
        "unit_cost_rpx_brl",
        "total_cost_rpx_brl",
        "unit_cost_direct_brl",
        "total_cost_direct_brl",
        "savings_brl",
        "savings_percent",
        "product_image_urls",
        "supplier_contact_image_urls",
        "calculation_payload"
      ].join(", ")
    )
    .eq("id", quoteId)
    .eq("client_id", appUser.client_id)
    .single();

  if (quoteError || !quote) {
    throw new Error(quoteError?.message ?? "Cotação não encontrada.");
  }

  const quotePayload = quote as unknown as Record<string, unknown>;
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      ...quotePayload,
      client_id: appUser.client_id,
      created_by_app_user_id: appUser.id,
      status: "submitted",
      simulation_request_requested_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select(quoteSelect)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Não foi possível duplicar a cotação.");
  }

  revalidatePath("/app");
  revalidatePath("/app/calculadora");
  revalidatePath("/admin/cotacoes");
  revalidatePath("/admin/dashboard");

  return mapQuoteRow(data as unknown as Parameters<typeof mapQuoteRow>[0]);
}

export async function requestFullSimulationAction(quoteId: string) {
  const { appUser } = await requireRole("client");

  if (!hasSupabaseConfig() || !appUser.client_id) {
    throw new Error("Cliente não vinculado ao usuário.");
  }

  const supabase = await createClient();
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("id, product_name")
    .eq("id", quoteId)
    .eq("client_id", appUser.client_id)
    .single();

  if (quoteError || !quote) {
    throw new Error(quoteError?.message ?? "Cotação não encontrada.");
  }

  const { data: existingSimulation } = await supabase
    .from("simulations")
    .select("id, status")
    .eq("quote_id", quoteId)
    .eq("client_id", appUser.client_id)
    .in("status", ["aguardando", "em_producao", "draft"])
    .maybeSingle();

  if (existingSimulation) {
    return {
      alreadyExists: true,
      simulationId: existingSimulation.id,
      status: existingSimulation.status
    };
  }

  const now = new Date().toISOString();
  const { data: simulation, error: simulationError } = await supabase
    .from("simulations")
    .insert({
      client_id: appUser.client_id,
      quote_id: quoteId,
      created_by_app_user_id: appUser.id,
      title: `Simulação completa - ${quote.product_name}`,
      status: "aguardando",
      requested_at: now
    })
    .select("id, status")
    .single();

  if (simulationError || !simulation) {
    throw new Error(simulationError?.message ?? "Não foi possível solicitar a simulação.");
  }

  const { error: updateQuoteError } = await supabase
    .from("quotes")
    .update({
      status: "simulation_requested",
      simulation_request_requested_at: now,
      updated_at: now
    })
    .eq("id", quoteId)
    .eq("client_id", appUser.client_id);

  if (updateQuoteError) {
    throw new Error(updateQuoteError.message);
  }

  revalidatePath("/app");
  revalidatePath("/app/calculadora");
  revalidatePath("/app/simulacoes");
  revalidatePath("/admin/cotacoes");
  revalidatePath("/admin/simulacoes");
  revalidatePath("/admin/dashboard");

  return {
    alreadyExists: false,
    simulationId: simulation.id,
    status: simulation.status
  };
}
