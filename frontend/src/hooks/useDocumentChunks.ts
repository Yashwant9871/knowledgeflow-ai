import { useQuery } from "@tanstack/react-query";
import { documentsService } from "@/lib/services";

export function useDocumentChunks(documentId: string) {
  return useQuery({
    queryKey: ["document-chunks", documentId],
    queryFn: () => documentsService.chunks(documentId),
    enabled: !!documentId,
  });
}
