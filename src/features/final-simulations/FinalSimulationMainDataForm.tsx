"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { FormField, SelectInput, TextInput } from "@/components/ui/FormField";
import type {
  FinalSimulationActionState,
  FinalSimulationClientOption,
  FinalSimulationMainDataValues
} from "./types";

function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? "Salvando..." : children}
    </Button>
  );
}

export function FinalSimulationMainDataForm({
  action,
  title,
  description,
  submitLabel,
  cancelHref,
  redirectOnSuccess,
  clients,
  values
}: {
  action: (
    previousState: FinalSimulationActionState<FinalSimulationMainDataValues>,
    formData: FormData
  ) => Promise<FinalSimulationActionState<FinalSimulationMainDataValues>>;
  title: string;
  description: string;
  submitLabel: string;
  cancelHref: string;
  redirectOnSuccess?: "detail" | "edit";
  clients: FinalSimulationClientOption[];
  values?: Partial<FinalSimulationMainDataValues>;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, {
    success: false,
    values
  });
  const currentValues = state.values ?? values ?? {};
  const errors = state.fieldErrors ?? {};
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (!state.success || !state.id || !redirectOnSuccess) {
      return;
    }

    const suffix = redirectOnSuccess === "edit" ? "/editar" : "";
    router.push(`/admin/simulacoes-finais/${state.id}${suffix}`);
  }, [redirectOnSuccess, router, state.id, state.success]);

  return (
    <Card title={title} description={description}>
      <form action={formAction} className="mt-4 grid gap-4" noValidate>
        {currentValues.simulationId ? (
          <input type="hidden" name="simulationId" value={currentValues.simulationId} />
        ) : null}
        {state.message ? (
          <DismissibleAlert
            key={`${state.message}-${JSON.stringify(errors)}`}
            variant={hasErrors ? "warning" : state.success ? "success" : "error"}
            className="mb-0"
          >
            {state.message}
          </DismissibleAlert>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <FormField label="Cliente" error={errors.customerId} errorId="customerId-error">
            <SelectInput
              name="customerId"
              defaultValue={currentValues.customerId ?? ""}
              aria-invalid={Boolean(errors.customerId)}
              aria-describedby={errors.customerId ? "customerId-error" : undefined}
            >
              <option value="">Sem cliente vinculado</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.label}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Nome do cliente" error={errors.customerName} errorId="customerName-error">
            <TextInput
              name="customerName"
              defaultValue={currentValues.customerName ?? ""}
              placeholder="Opcional quando houver cliente vinculado"
              aria-invalid={Boolean(errors.customerName)}
              aria-describedby={errors.customerName ? "customerName-error" : undefined}
            />
          </FormField>

          <FormField label="Fornecedor" error={errors.supplierName} errorId="supplierName-error">
            <TextInput
              name="supplierName"
              defaultValue={currentValues.supplierName ?? ""}
              aria-invalid={Boolean(errors.supplierName)}
              aria-describedby={errors.supplierName ? "supplierName-error" : undefined}
            />
          </FormField>

          <FormField label="Data da cotação" error={errors.quoteDate} errorId="quoteDate-error">
            <TextInput
              name="quoteDate"
              type="date"
              defaultValue={currentValues.quoteDate ?? ""}
              required
              aria-invalid={Boolean(errors.quoteDate)}
              aria-describedby={errors.quoteDate ? "quoteDate-error" : undefined}
            />
          </FormField>

          <FormField label="Validade" error={errors.validUntil} errorId="validUntil-error">
            <TextInput
              name="validUntil"
              type="date"
              defaultValue={currentValues.validUntil ?? ""}
              required
              aria-invalid={Boolean(errors.validUntil)}
              aria-describedby={errors.validUntil ? "validUntil-error" : undefined}
            />
          </FormField>

          <FormField label="Modalidade de importação" error={errors.importModality} errorId="importModality-error">
            <SelectInput
              name="importModality"
              defaultValue={currentValues.importModality ?? ""}
              required
              aria-invalid={Boolean(errors.importModality)}
              aria-describedby={errors.importModality ? "importModality-error" : undefined}
            >
              <option value="">Selecione</option>
              <option value="propria">Própria</option>
              <option value="conta_e_ordem">Conta e ordem</option>
              <option value="encomenda">Encomenda</option>
            </SelectInput>
          </FormField>

          <FormField label="Via de transporte" error={errors.transportMode} errorId="transportMode-error">
            <SelectInput
              name="transportMode"
              defaultValue={currentValues.transportMode ?? ""}
              required
              aria-invalid={Boolean(errors.transportMode)}
              aria-describedby={errors.transportMode ? "transportMode-error" : undefined}
            >
              <option value="">Selecione</option>
              <option value="maritimo">Marítimo</option>
              <option value="aereo">Aéreo</option>
              <option value="rodoviario">Rodoviário</option>
            </SelectInput>
          </FormField>

          <FormField label="Origem" error={errors.origin} errorId="origin-error">
            <TextInput
              name="origin"
              defaultValue={currentValues.origin ?? ""}
              required
              aria-invalid={Boolean(errors.origin)}
              aria-describedby={errors.origin ? "origin-error" : undefined}
            />
          </FormField>

          <FormField label="Destino" error={errors.destination} errorId="destination-error">
            <TextInput
              name="destination"
              defaultValue={currentValues.destination ?? ""}
              required
              aria-invalid={Boolean(errors.destination)}
              aria-describedby={errors.destination ? "destination-error" : undefined}
            />
          </FormField>

          <FormField label="Destino final" error={errors.finalDestination} errorId="finalDestination-error">
            <TextInput name="finalDestination" defaultValue={currentValues.finalDestination ?? ""} />
          </FormField>

          <FormField label="Estado destino" error={errors.destinationState} errorId="destinationState-error">
            <TextInput name="destinationState" defaultValue={currentValues.destinationState ?? ""} maxLength={2} />
          </FormField>

          <FormField label="País" error={errors.country} errorId="country-error">
            <TextInput name="country" defaultValue={currentValues.country ?? ""} placeholder="BR" />
          </FormField>

          <FormField label="Incoterm" error={errors.incoterm} errorId="incoterm-error">
            <TextInput
              name="incoterm"
              defaultValue={currentValues.incoterm ?? ""}
              placeholder="FOB, CIF..."
              required
              aria-invalid={Boolean(errors.incoterm)}
              aria-describedby={errors.incoterm ? "incoterm-error" : undefined}
            />
          </FormField>

          <FormField label="Moeda" error={errors.currency} errorId="currency-error">
            <TextInput
              name="currency"
              defaultValue={currentValues.currency ?? "USD"}
              maxLength={3}
              required
              aria-invalid={Boolean(errors.currency)}
              aria-describedby={errors.currency ? "currency-error" : undefined}
            />
          </FormField>

          <FormField label="Câmbio" error={errors.exchangeRate} errorId="exchangeRate-error">
            <TextInput
              name="exchangeRate"
              defaultValue={currentValues.exchangeRate ?? 0}
              inputMode="decimal"
              required
              aria-invalid={Boolean(errors.exchangeRate)}
              aria-describedby={errors.exchangeRate ? "exchangeRate-error" : undefined}
            />
          </FormField>
        </div>

        <FormField label="Observações" error={errors.notes} errorId="notes-error">
          <textarea
            name="notes"
            defaultValue={currentValues.notes ?? ""}
            rows={5}
            className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10"
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? "notes-error" : undefined}
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
