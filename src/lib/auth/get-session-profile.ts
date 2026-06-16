import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { findMockUser, hasSupabaseConfig, mockUserToAppUser, MOCK_AUTH_COOKIE } from "@/lib/auth/mock-users";
import { createClient } from "@/lib/supabase/server";
import type { AppUser, UserRole } from "@/lib/types";

export async function getSessionProfile() {
  if (!hasSupabaseConfig()) {
    const cookieStore = await cookies();
    const email = cookieStore.get(MOCK_AUTH_COOKIE)?.value;
    const mockUser = email ? findMockUser(email) : null;

    if (!mockUser) {
      redirect("/login");
    }

    return {
      user: {
        id: mockUser.id,
        email: mockUser.email
      },
      appUser: mockUserToAppUser(mockUser)
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: appUser } = await supabase
    .from("app_users")
    .select("*")
    .eq("auth_provider", "supabase")
    .eq("auth_provider_user_id", user.id)
    .single();

  if (!appUser) {
    redirect("/login?error=missing-app-user");
  }

  return {
    user,
    appUser: appUser as AppUser
  };
}

export async function requireRole(role: UserRole) {
  const session = await getSessionProfile();

  if (session.appUser.role !== role) {
    redirect(session.appUser.role === "admin" ? "/admin/dashboard" : "/app");
  }

  return session;
}
