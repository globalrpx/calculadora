import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { getClientSimulations } from "@/lib/client/quotes";
import type { ClientSimulationRecord } from "@/lib/client/types";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function mapStatus(status: string) {
  switch (status) {
    case "aguardando":
      return "Aguardando contato";
    case "em_producao":
      return "Em produção";
    case "published":
    case "finalizado":
      return "Disponível";
    case "cancelado":
      return "Cancelada";
    default:
      return "Rascunho";
  }
}

export default async function ClientSimulationsPage() {
  const simulations = await getClientSimulations();
  const columns: DataTableColumn<ClientSimulationRecord>[] = [
    {
      key: "createdAt",
      header: "Data",
      render: (simulation) => formatDate(simulation.createdAt)
    },
    { key: "title", header: "Simulação" },
    {
      key: "quote",
      header: "Cotação",
      render: (simulation) =>
        simulation.quote ? `${simulation.quote.productName} - NCM: ${simulation.quote.hsCode || "-"}` : "-"
    },
    {
      key: "status",
      header: "Status",
      render: (simulation) => mapStatus(simulation.status)
    },
    {
      key: "quoteFileUrl",
      header: "Arquivo",
      render: (simulation) =>
        simulation.quoteFileUrl ? (
          <Link
            href={simulation.quoteFileUrl}
            className="font-semibold text-rpx-blue"
            target="_blank"
            rel="noreferrer"
          >
            Abrir arquivo
          </Link>
        ) : (
          "Ainda não disponível"
        )
    }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Cliente"
        title="Simulações"
        description="Acompanhe as solicitações de simulação completa e os arquivos publicados pela Global RPX."
      />
      {simulations.length === 0 ? (
        <EmptyState
          title="Nenhuma simulação solicitada ainda"
          description="Quando você solicitar uma simulação completa a partir de uma cotação, ela aparecerá aqui."
        />
      ) : (
        <DataTable columns={columns} rows={simulations} />
      )}
    </>
  );
}
