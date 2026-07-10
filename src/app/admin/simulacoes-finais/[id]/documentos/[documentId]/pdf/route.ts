import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/get-session-profile";
import { createAdminClient } from "@/lib/supabase/admin";

const uploadsBucket = "app-uploads";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  await requireRole("admin");
  const { id, documentId } = await params;
  const url = new URL(request.url);
  const shouldDownload = url.searchParams.get("download") === "1";
  const adminSupabase = createAdminClient();
  const { data: document, error } = await adminSupabase
    .from("simulation_documents")
    .select("id, simulation_id, document_type, file_name, file_path")
    .eq("id", documentId)
    .eq("simulation_id", id)
    .in("document_type", ["client_pdf", "internal_detailed_report"])
    .maybeSingle();

  if (error || !document?.file_path) {
    return new NextResponse("Documento não encontrado.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }

  const { data: file, error: downloadError } = await adminSupabase.storage
    .from(uploadsBucket)
    .download(document.file_path);

  if (downloadError || !file) {
    return new NextResponse("Não foi possível carregar o PDF.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }

  return new NextResponse(file, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `${shouldDownload ? "attachment" : "inline"}; filename="${document.file_name}"`,
      "cache-control": "no-store"
    }
  });
}
