import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";

const parameters = [
  ["Fator RPX padrao", "1.8"],
  ["Fator importacao direta padrao", "2.2"],
  ["Maximo de imagens por cotacao", "5"],
  ["Fonte do dolar", "PTAX venda"]
];

export default function ParametersPage() {
  return (
    <>
      <PageHeader
        title="Parametros"
        description="Lista placeholder dos parametros comerciais e operacionais que serao gerenciados no Supabase."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {parameters.map(([title, value]) => (
          <Card key={title} title={title} value={value} />
        ))}
      </div>
    </>
  );
}
