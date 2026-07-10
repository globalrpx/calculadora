"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findMockUser, hasSupabaseConfig, MOCK_AUTH_COOKIE } from "@/lib/auth/mock-users";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!hasSupabaseConfig()) {
    const mockUser = findMockUser(email);

    if (!mockUser) {
      redirect("/login?error=mock-user-not-found");
    }

    const cookieStore = await cookies();
    cookieStore.set(MOCK_AUTH_COOKIE, mockUser.email, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    redirect(mockUser.role === "admin" ? "/admin/dashboard" : "/app");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=session-not-created");
  }

  const { data: appUser } = await supabase
    .from("app_users")
    .select("role, status, deleted_at")
    .eq("auth_provider", "supabase")
    .eq("auth_provider_user_id", user.id)
    .single();

  if (!appUser) {
    redirect("/login?error=missing-app-user");
  }

  if (appUser.status !== "active" || appUser.deleted_at) {
    await supabase.auth.signOut();
    redirect("/login?error=account-inactive");
  }

  redirect(appUser.role === "admin" ? "/admin/dashboard" : "/app");
}

export async function signOutAction() {
  if (!hasSupabaseConfig()) {
    const cookieStore = await cookies();
    cookieStore.delete(MOCK_AUTH_COOKIE);
    redirect("/");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signUpAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const acceptedTerms = formData.get("acceptedTerms") === "on";

  if (!hasSupabaseConfig()) {
    redirect("/cadastro?error=supabase-not-configured");
  }

  if (!name || !email || !phone || password.length < 6) {
    redirect("/cadastro?error=invalid-fields");
  }

  if (!acceptedTerms) {
    redirect("/cadastro?error=terms");
  }

  const supabase = await createClient();
  let adminSupabase;

  try {
    adminSupabase = createAdminClient();
  } catch {
    redirect("/cadastro?error=service-role-not-configured");
  }

  const { data: createdClient, error: createClientError } = await adminSupabase
    .from("clients")
    .insert({
      company_name: company || null,
      trade_name: company || null,
      contact_name: name,
      contact_email: email,
      contact_phone: phone,
      client_type: "lead",
      source: "site",
      status: "active"
    })
    .select("id")
    .single();

  if (createClientError || !createdClient) {
    redirect(`/cadastro?error=${encodeURIComponent(createClientError?.message ?? "create-client-failed")}`);
  }

  const { data: createdUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      company: company || null,
      phone,
      role: "client"
    }
  });

  if (createUserError || !createdUser.user) {
    await adminSupabase.from("clients").delete().eq("id", createdClient.id);
    redirect(`/cadastro?error=${encodeURIComponent(createUserError?.message ?? "create-user-failed")}`);
  }

  const { error: insertAppUserError } = await adminSupabase.from("app_users").insert({
    name,
    email,
    phone,
    role: "client",
    status: "active",
    client_id: createdClient.id,
    auth_provider: "supabase",
    auth_provider_user_id: createdUser.user.id,
    accepted_terms_at: new Date().toISOString()
  });

  if (insertAppUserError) {
    await adminSupabase.auth.admin.deleteUser(createdUser.user.id);
    await adminSupabase.from("clients").delete().eq("id", createdClient.id);
    redirect(`/cadastro?error=${encodeURIComponent(insertAppUserError.message)}`);
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    redirect("/login?registered=success");
  }

  redirect("/app");
}
