export type ClientFormValues = {
  id?: string;
  companyName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

export type ClientFormFieldErrors = Partial<
  Record<"contactName" | "contactEmail" | "contactPhone" | "password" | "confirmPassword", string>
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
