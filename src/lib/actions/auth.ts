"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findMockUser, hasSupabaseConfig, MOCK_AUTH_COOKIE } from "@/lib/auth/mock-users";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) {
    redirect("/login?error=missing-profile");
  }

  redirect(profile.role === "admin" ? "/admin/dashboard" : "/app");
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
