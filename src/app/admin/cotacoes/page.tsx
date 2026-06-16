import { getAdminQuotes } from "@/lib/admin/queries";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value ?? 0);
}

function mapStatus(status: string) {
  switch (status) {
    case "simulation_requested":
      return "Simulação solicitada";
    case "in_review":
      return "Em análise";
    case "completed":
      return "Concluída";
    case "draft":
      return "Rascunho";
    default:
      return "Recebida";
  }
}

export default async function QuotesPage() {
  const quotes = await getAdminQuotes();

  const columns: DataTableColumn<(typeof quotes)[number]>[] = [
    {
      key: "created_at",
      header: "Data",
      render: (row) => formatDate(row.created_at)
    },
    {
      key: "client",
      header: "Cliente",
      render: (row) => row.client?.trade_name || row.client?.company_name || "-"
    },
    { key: "product_name", header: "Produto" },
    {
      key: "status",
      header: "Status",
      render: (row) => mapStatus(row.status)
    },
    {
      key: "total_cost_rpx_brl",
      header: "Via RPX",
      render: (row) => formatMoney(row.total_cost_rpx_brl)
    },
    {
      key: "savings_brl",
      header: "Economia",
      render: (row) => formatMoney(row.savings_brl)
    }
  ];

  return (
    <>
      <PageHeader
        title="Cotações"
        description="Listagem das cotações persistidas no sistema. O próximo passo será permitir o pedido de simulação completa a partir da área do cliente."
      />
      <DataTable columns={columns} rows={quotes} emptyLabel="Nenhuma cotação registrada no banco até o momento." />
    </>
  );
}
