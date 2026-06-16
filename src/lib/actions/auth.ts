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
    .select("role")
    .eq("auth_provider", "supabase")
    .eq("auth_provider_user_id", user.id)
    .single();

  if (!appUser) {
    redirect("/login?error=missing-app-user");
  }

  redirect(appUser.role === "admin" ? "/admin/dashboard" : "/app");
}

export async function signOutAction() {
  if (!hasSupabaseConfig()) {
    const cookieStore = await cookies();
    cookieStore.delete(MOCK_AUTH_COOKIE);
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signUpAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
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
  const adminSupabase = createAdminClient();

  const { data: createdUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      phone,
      role: "client"
    }
  });

  if (createUserError || !createdUser.user) {
    redirect(`/cadastro?error=${encodeURIComponent(createUserError?.message ?? "create-user-failed")}`);
  }

  const { error: insertAppUserError } = await adminSupabase.from("app_users").insert({
    name,
    email,
    phone,
    role: "client",
    status: "active",
    auth_provider: "supabase",
    auth_provider_user_id: createdUser.user.id,
    accepted_terms_at: new Date().toISOString()
  });

  if (insertAppUserError) {
    await adminSupabase.auth.admin.deleteUser(createdUser.user.id);
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
