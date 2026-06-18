"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { FormField, SelectInput, TextInput } from "@/components/ui/FormField";
import {
  initialSimulationFormState,
  simulationStatusOptions,
  type SimulationFormState,
  type SimulationFormValues
} from "@/lib/admin/simulation-form-state";

type SimulationOption = {
  id: string;
  label: string;
};

type QuoteOption = {
  id: string;
  clientId: string;
  label: string;
};

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? "Salvando..." : children}
    </Button>
  );
}

export function SimulationFormCard({
  action,
  title,
  description,
  submitLabel,
  values,
  clients = [],
  quotes = [],
  cancelHref
}: {
  action: (previousState: SimulationFormState, formData: FormData) => Promise<SimulationFormState>;
  title: string;
  description: string;
  submitLabel: string;
  values?: SimulationFormValues;
  clients?: SimulationOption[];
  quotes?: QuoteOption[];
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, {
    ...initialSimulationFormState,
    values
  });
  const currentValues = state.values ?? values;
  const errors = state.fieldErrors ?? {};
  const hasErrors = Object.keys(errors).length > 0;
  const isEditing = Boolean(currentValues?.id);

  return (
    <Card title={title} description={description}>
      <form action={formAction} className="mt-4 grid gap-4" noValidate>
        {currentValues?.id ? <input type="hidden" name="simulationId" value={currentValues.id} /> : null}
        {state.message ? (
          <DismissibleAlert
            key={`${state.message}-${JSON.stringify(errors)}`}
            variant={hasErrors ? "warning" : "error"}
            className="mb-0"
          >
            {state.message}
          </DismissibleAlert>
        ) : null}
        <FormField label="Cliente" error={errors.clientId} errorId="clientId-error">
          {isEditing ? (
            <>
              <input type="hidden" name="clientId" value={currentValues?.clientId ?? ""} />
              <TextInput
                value={clients.find((client) => client.id === currentValues?.clientId)?.label ?? "Cliente"}
                disabled
                readOnly
              />
            </>
          ) : (
            <SelectInput
              name="clientId"
              defaultValue={currentValues?.clientId ?? ""}
              aria-invalid={Boolean(errors.clientId)}
              aria-describedby={errors.clientId ? "clientId-error" : undefined}
            >
              <option value="">Selecione</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.label}
                </option>
              ))}
            </SelectInput>
          )}
        </FormField>
        <FormField
          label="Cotação vinculada"
          help="Opcional. A cotação ajuda a preencher os dados de produto, FOB e fornecedor no detalhe."
          error={errors.quoteId}
          errorId="quoteId-error"
        >
          {isEditing ? (
            <>
              <input type="hidden" name="quoteId" value={currentValues?.quoteId ?? ""} />
              <TextInput
                value={quotes.find((quote) => quote.id === currentValues?.quoteId)?.label ?? "Sem cotação vinculada"}
                disabled
                readOnly
              />
            </>
          ) : (
            <SelectInput
              name="quoteId"
              defaultValue={currentValues?.quoteId ?? ""}
              aria-invalid={Boolean(errors.quoteId)}
              aria-describedby={errors.quoteId ? "quoteId-error" : undefined}
            >
              <option value="">Sem cotação vinculada</option>
              {quotes.map((quote) => (
                <option key={quote.id} value={quote.id}>
                  {quote.label}
                </option>
              ))}
            </SelectInput>
          )}
        </FormField>
        <FormField label="Título" error={errors.title} errorId="title-error">
          <TextInput
            name="title"
            defaultValue={currentValues?.title ?? ""}
            placeholder="Ex: Simulação completa - Produto"
            disabled={isEditing}
            readOnly={isEditing}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
        </FormField>
        <FormField label="Status" error={errors.status} errorId="status-error">
          <SelectInput
            name="status"
            defaultValue={currentValues?.status ?? "aguardando"}
            aria-invalid={Boolean(errors.status)}
            aria-describedby={errors.status ? "status-error" : undefined}
          >
            {simulationStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField
          label="URL ou caminho do arquivo"
          help="Use uma URL http(s) ou um caminho interno existente. Upload real para Storage fica para fase futura."
          error={errors.quoteFileUrl}
          errorId="quoteFileUrl-error"
        >
          <TextInput
            name="quoteFileUrl"
            defaultValue={currentValues?.quoteFileUrl ?? ""}
            placeholder="https://... ou caminho/arquivo.pdf"
            aria-invalid={Boolean(errors.quoteFileUrl)}
            aria-describedby={errors.quoteFileUrl ? "quoteFileUrl-error" : undefined}
          />
        </FormField>
        <FormField label="Observações para o cliente" error={errors.clientNotes} errorId="clientNotes-error">
          <textarea
            name="clientNotes"
            defaultValue={currentValues?.clientNotes ?? ""}
            rows={5}
            className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10"
            aria-invalid={Boolean(errors.clientNotes)}
            aria-describedby={errors.clientNotes ? "clientNotes-error" : undefined}
          />
        </FormField>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <ButtonLink href={cancelHref} variant="secondary" className="w-full sm:w-auto">
            Cancelar
          </ButtonLink>
          <SubmitButton>{submitLabel}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
