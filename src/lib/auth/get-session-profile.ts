import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { findMockUser, hasSupabaseConfig, mockUserToProfile, MOCK_AUTH_COOKIE } from "@/lib/auth/mock-users";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

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
      profile: mockUserToProfile(mockUser)
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) {
    redirect("/login?error=missing-profile");
  }

  return {
    user,
    profile: profile as Profile
  };
}

export async function requireRole(role: UserRole) {
  const session = await getSessionProfile();

  if (session.profile.role !== role) {
    redirect(session.profile.role === "admin" ? "/admin/dashboard" : "/app");
  }

  return session;
}
