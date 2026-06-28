import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsService } from "@/lib/services";
import { toast } from "sonner";

export function useIndexing(documentId: string) {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["document-indexing-status", documentId],
    queryFn: () => documentsService.indexingStatus(documentId),
    refetchInterval: (query) => {
      // Poll every 2 seconds if document is actively extracting or indexing
      const data = query.state.data;
      if (data && (data.status === "INDEXING" || data.extractionStatus === "EXTRACTING")) {
        return 2000;
      }
      return false;
    },
  });

  const reindexMutation = useMutation({
    mutationFn: () => documentsService.reindex(documentId),
    onSuccess: (data) => {
      toast.success("Reindexing pipeline triggered successfully.");
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      queryClient.invalidateQueries({ queryKey: ["document-indexing-status", documentId] });
      queryClient.invalidateQueries({ queryKey: ["document-chunks", documentId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to trigger reindexing.");
    },
  });

  return {
    status: statusQuery.data,
    isLoading: statusQuery.isLoading,
    isRefetching: statusQuery.isRefetching,
    refetch: statusQuery.refetch,
    reindex: reindexMutation.mutate,
    isReindexing: reindexMutation.isPending,
  };
}
