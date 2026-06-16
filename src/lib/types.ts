export type UserRole = "admin" | "client";

export type Profile = {
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
