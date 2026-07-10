import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";
import {
  buildFinalSimulationClientPdf,
  buildFinalSimulationClientPdfFilename,
  isUsableFinalSimulationPublicSnapshot
} from "@/features/final-simulations/client-pdf-generator";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("final_simulations")
    .select("id, public_snapshot")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return new NextResponse("Simulação final não encontrada.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }

  if (!isUsableFinalSimulationPublicSnapshot(data.public_snapshot)) {
    return new NextResponse("Gere os snapshots dos documentos antes de gerar o PDF cliente.", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }

  const pdf = buildFinalSimulationClientPdf(data.public_snapshot, data.id);
  const filename = buildFinalSimulationClientPdfFilename(data.public_snapshot, data.id);

  return new NextResponse(pdf, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${filename}"`,
      "cache-control": "no-store"
    }
  });
}
