export type AdminUserFormValues = {
  id?: string;
  name: string;
  email: string;
  status: string;
};

export type AdminUserFormFieldErrors = Partial<Record<"name" | "email" | "status" | "password" | "confirmPassword", string>>;

export type AdminUserFormState = {
  success: boolean;
  message?: string;
  fieldErrors?: AdminUserFormFieldErrors;
  values?: AdminUserFormValues;
};

export const adminUserStatusOptions = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" }
] as const;

export const adminUserStatusValues = adminUserStatusOptions.map((option) => option.value);

export const initialAdminUserFormState: AdminUserFormState = {
  success: false
};
