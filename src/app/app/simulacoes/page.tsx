import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UploadFilesCell } from "@/components/uploads/UploadFilesCell";
import { getClientSimulations } from "@/lib/client/quotes";
import { getClientUploadSignedUrl } from "@/lib/uploads/actions";
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

function mapStatusVariant(status: string) {
  switch (status) {
    case "finalizado":
    case "published":
      return "success";
    case "em_producao":
      return "info";
    case "cancelado":
      return "danger";
    case "aguardando":
    case "draft":
    default:
      return "neutral";
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
      render: (simulation) => (
        <StatusBadge variant={mapStatusVariant(simulation.status)}>{mapStatus(simulation.status)}</StatusBadge>
      )
    },
    {
      key: "uploads",
      header: "Arquivo",
      render: (simulation) => (
        <UploadFilesCell
          uploads={simulation.uploads}
          emptyLabel="Ainda não disponível"
          getSignedUrl={getClientUploadSignedUrl}
        />
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
