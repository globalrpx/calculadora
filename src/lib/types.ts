export type UserRole = "admin" | "client";

export type AppUser = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
  status: "active" | "inactive";
  client_id: string | null;
  auth_provider: string | null;
  auth_provider_user_id: string | null;
  accepted_terms_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LegacyProfile = {
  id: string;
  auth_user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  client_id: string | null;
  created_at: string;
  updated_at: string;
};
