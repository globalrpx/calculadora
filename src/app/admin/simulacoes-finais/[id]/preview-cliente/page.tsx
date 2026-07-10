import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { buildFinalSimulationClientReportData } from "@/features/final-simulations/client-report-builder";
import { FinalSimulationClientPreview } from "@/features/final-simulations/FinalSimulationClientPreview";

export default async function FinalSimulationClientPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await buildFinalSimulationClientReportData(id);

  if (!report) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Preview cliente"
        title={`Preview HTML - ${report.header.identifier}`}
        description="Prévia visual do documento do cliente e geração temporária do PDF a partir do snapshot público."
      />

      <FinalSimulationClientPreview report={report} />
    </>
  );
}
