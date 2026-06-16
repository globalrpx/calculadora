import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";

const parameters = [
  ["Fator RPX padrão", "1.8"],
  ["Fator importação direta padrão", "2.2"],
  ["Máximo de imagens por cotação", "5"],
  ["Fonte do dólar", "PTAX venda"]
];

export default function ParametersPage() {
  return (
    <>
      <PageHeader
        title="Parâmetros"
        description="Lista placeholder dos parâmetros comerciais e operacionais que serão gerenciados no Supabase."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {parameters.map(([title, value]) => (
          <Card key={title} title={title} value={value} />
        ))}
      </div>
    </>
  );
}
