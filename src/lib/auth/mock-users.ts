import type { AppUser, UserRole } from "@/lib/types";

export const MOCK_AUTH_COOKIE = "global_rpx_mock_user";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId: string | null;
  company: string;
};

export const mockUsers: MockUser[] = [
  {
    id: "mock-client-1",
    name: "Cliente 1",
    email: "cliente1@gmail.com",
    role: "client",
    clientId: "client-1",
    company: "Cliente 1 Importadora"
  },
  {
    id: "mock-client-2",
    name: "Cliente 2",
    email: "cliente2@gmail.com",
    role: "client",
    clientId: "client-2",
    company: "Cliente 2 Comercio"
  },
  {
    id: "mock-admin-1",
    name: "Admin RPX",
    email: "admin@globalrpx.com",
    role: "admin",
    clientId: null,
    company: "Global RPX"
  }
];

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function findMockUser(email: string) {
  return mockUsers.find((user) => user.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
}

export function getDefaultClientUser() {
  return mockUsers[0];
}

export function mockUserToAppUser(user: MockUser): AppUser {
  const now = new Date().toISOString();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: null,
    role: user.role,
    status: "active",
    client_id: user.clientId,
    auth_provider: "mock",
    auth_provider_user_id: user.id,
    accepted_terms_at: now,
    deleted_at: null,
    created_at: now,
    updated_at: now
  };
}
