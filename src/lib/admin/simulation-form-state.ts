export type SimulationFormValues = {
  id?: string;
  clientId: string;
  quoteId: string;
  title: string;
  status: string;
  clientNotes: string;
  quoteFileUrl: string;
};

export type SimulationFormFieldErrors = Partial<Record<keyof SimulationFormValues, string>>;

export type SimulationFormState = {
  success: boolean;
  message?: string;
  fieldErrors?: SimulationFormFieldErrors;
  values?: SimulationFormValues;
};

export const simulationStatusOptions = [
  { value: "aguardando", label: "Aguardando" },
  { value: "em_producao", label: "Em produção" },
  { value: "finalizado", label: "Finalizado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" }
] as const;

export const simulationStatusValues = simulationStatusOptions.map((option) => option.value);

export const initialSimulationFormState: SimulationFormState = {
  success: false
};
