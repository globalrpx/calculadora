import { createConfigAction, updateConfigAction } from "@/lib/actions/config";
import {
  ConfigTableUnavailableError,
  type AppConfigRow,
  defaultImportFactor,
  getAllConfigs,
  importFactorConfigKey
} from "@/lib/config/app-config";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { Button } from "@/components/ui/Button";
import { FormField, TextInput } from "@/components/ui/FormField";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(value));
}

function getConfigHelp(key: string) {
  if (key === importFactorConfigKey) {
    return "Número decimal positivo. Ex.: 1.8, 2 ou 1.65.";
  }

  return "Valor salvo como texto. A validação específica deve ser feita no uso da configuração.";
}

export default async function AdminConfigurationsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  let configs: AppConfigRow[] = [];
  let tableUnavailableMessage = "";

  try {
    configs = await getAllConfigs();
  } catch (error) {
    if (error instanceof ConfigTableUnavailableError) {
      tableUnavailableMessage = error.message;
    } else {
      throw error;
    }
  }

  const error = typeof params.error === "string" ? params.error : "";
  const created = params.created === "1";
  const updated = params.updated === "1";

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Parâmetros globais usados por fluxos internos da plataforma."
      />

      {created ? <DismissibleAlert>Configuração criada com sucesso.</DismissibleAlert> : null}
      {updated ? <DismissibleAlert>Configuração atualizada com sucesso.</DismissibleAlert> : null}
      {error ? <DismissibleAlert variant="error">{error}</DismissibleAlert> : null}
      {tableUnavailableMessage ? (
        <DismissibleAlert variant="warning">
          {tableUnavailableMessage} Enquanto isso, novas cotações continuam usando o fallback {defaultImportFactor}.
        </DismissibleAlert>
      ) : null}

      <div className="grid gap-6">
        <Card title="Nova configuração" description="Use chaves técnicas em snake_case. A chave não pode ser alterada depois de criada.">
          <form action={createConfigAction} className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_2fr_auto] lg:items-end">
            <FormField label="Chave" help="Ex.: import_factor">
              <TextInput name="key" required pattern="[a-z0-9_]+" placeholder="nova_chave" disabled={Boolean(tableUnavailableMessage)} />
            </FormField>
            <FormField label="Valor">
              <TextInput name="value" required placeholder="1.8" disabled={Boolean(tableUnavailableMessage)} />
            </FormField>
            <FormField label="Descrição">
              <TextInput name="description" placeholder="Descrição interna da configuração" disabled={Boolean(tableUnavailableMessage)} />
            </FormField>
            <Button type="submit" disabled={Boolean(tableUnavailableMessage)}>Criar</Button>
          </form>
        </Card>

        <Card title="Configurações existentes">
          <div className="mt-4 grid gap-4">
            {configs.length ? (
              configs.map((config) => (
                <form
                  key={config.id}
                  action={updateConfigAction}
                  className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1fr_1fr_2fr_auto] lg:items-end"
                >
                  <input type="hidden" name="id" value={config.id} />
                  <input type="hidden" name="key" value={config.key} />
                  <FormField label="Chave" help={`Atualizada em ${formatDateTime(config.updated_at)}`}>
                    <TextInput value={config.key} readOnly className="bg-slate-100 text-slate-600" />
                  </FormField>
                  <FormField label="Valor" help={getConfigHelp(config.key)}>
                    <TextInput name="value" required defaultValue={config.value} inputMode={config.key === importFactorConfigKey ? "decimal" : "text"} />
                  </FormField>
                  <FormField label="Descrição">
                    <TextInput name="description" defaultValue={config.description ?? ""} />
                  </FormField>
                  <Button type="submit" variant="secondary">Salvar</Button>
                </form>
              ))
            ) : (
              <p className="text-sm text-slate-600">Nenhuma configuração cadastrada.</p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
