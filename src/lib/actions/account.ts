"use server";

import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseConfig } from "@/lib/auth/mock-users";

function readProfileFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim()
  };
}

export async function updateMyAccountAction(formData: FormData) {
  const { appUser } = await getSessionProfile();
  const { name, company, email, phone } = readProfileFields(formData);

  if (!name || !email) {
    redirect("/conta?error=invalid-fields");
  }

  if (!hasSupabaseConfig()) {
    redirect("/conta?updated=1");
  }

  const adminSupabase = createAdminClient();

  const { data: duplicatedEmail } = await adminSupabase
    .from("app_users")
    .select("id")
    .ilike("email", email)
    .neq("id", appUser.id)
    .is("deleted_at", null)
    .limit(1);

  if (duplicatedEmail && duplicatedEmail.length > 0) {
    redirect("/conta?error=email-exists");
  }

  const now = new Date().toISOString();
  const { error: updateAppUserError } = await adminSupabase
    .from("app_users")
    .update({
      name,
      email,
      phone: phone || null,
      updated_at: now
    })
    .eq("id", appUser.id)
    .is("deleted_at", null);

  if (updateAppUserError) {
    redirect(`/conta?error=${encodeURIComponent(updateAppUserError.message)}`);
  }

  if (appUser.client_id) {
    const { error: updateClientError } = await adminSupabase
      .from("clients")
      .update({
        company_name: company || null,
        trade_name: company || null,
        contact_name: name,
        contact_email: email,
        contact_phone: phone || null,
        updated_at: now
      })
      .eq("id", appUser.client_id)
      .is("deleted_at", null);

    if (updateClientError) {
      redirect(`/conta?error=${encodeURIComponent(updateClientError.message)}`);
    }
  }

  if (appUser.auth_provider === "supabase" && appUser.auth_provider_user_id) {
    const { error: updateAuthError } = await adminSupabase.auth.admin.updateUserById(appUser.auth_provider_user_id, {
      email,
      user_metadata: {
        name,
        company: company || null,
        phone: phone || null,
        role: appUser.role
      }
    });

    if (updateAuthError) {
      redirect(`/conta?error=${encodeURIComponent(updateAuthError.message)}`);
    }
  }

  redirect("/conta?updated=1");
}

export async function updateMyPasswordAction(formData: FormData) {
  const { appUser } = await getSessionProfile();

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 6 || password !== confirmPassword) {
    redirect("/conta?error=password-invalid");
  }

  if (!hasSupabaseConfig()) {
    redirect("/conta?passwordUpdated=1");
  }

  if (!appUser.auth_provider_user_id) {
    redirect("/conta?error=password-provider");
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.auth.admin.updateUserById(appUser.auth_provider_user_id, {
    password
  });

  if (error) {
    redirect(`/conta?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/conta?passwordUpdated=1");
}
