export type ClientFormValues = {
  id?: string;
  companyName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  clientType?: ClientType;
};

export const clientTypeValues = ["lead", "client"] as const;

export type ClientType = (typeof clientTypeValues)[number];

export type ClientFormFieldErrors = Partial<
  Record<"contactName" | "contactEmail" | "contactPhone" | "clientType" | "password" | "confirmPassword", string>
>;

export type ClientFormState = {
  success: boolean;
  message?: string;
  fieldErrors?: ClientFormFieldErrors;
  values?: ClientFormValues;
};

export const initialClientFormState: ClientFormState = {
  success: false
};
