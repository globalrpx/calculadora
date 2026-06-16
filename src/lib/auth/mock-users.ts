import type { Profile, UserRole } from "@/lib/types";

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

export function mockUserToProfile(user: MockUser): Profile {
  const now = new Date().toISOString();

  return {
    id: user.id,
    auth_user_id: user.id,
    name: user.name,
    email: user.email,
    phone: null,
    role: user.role,
    client_id: user.clientId,
    created_at: now,
    updated_at: now
  };
}
