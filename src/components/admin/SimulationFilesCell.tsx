"use client";

import { UploadFilesCell } from "@/components/uploads/UploadFilesCell";
import { getUploadSignedUrl } from "@/lib/uploads/actions";
import type { AdminSimulationUpload } from "@/lib/admin/queries";

export function SimulationFilesCell({ uploads }: { uploads: AdminSimulationUpload[] }) {
  return <UploadFilesCell uploads={uploads} emptyLabel="Pendente" getSignedUrl={getUploadSignedUrl} />;
}
