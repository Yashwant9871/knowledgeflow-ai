import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { Search as SearchIcon, MousePointerClick } from "lucide-react";
import { PageHeader, Card, EmptyState } from "@/components/ui-kit";
import { searchHistoryService, documentsService } from "@/lib/services";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_app/search-history")({
  component: SearchHistoryPage,
  head: () => ({ meta: [{ title: "Search history · KnowledgeFlow AI" }] }),
});

function SearchHistoryPage() {
  return (
    <>
      <PageHeader title="Search History" description="Every query run across the workspace, with filters and results." />
      <div className="p-6">
        <Suspense fallback={<Card className="h-96 animate-pulse" />}>
          <HistoryBody />
        </Suspense>
      </div>
    </>
  );
}

function HistoryBody() {
  const { data: history } = useSuspenseQuery({ queryKey: ["search-history"], queryFn: () => searchHistoryService.list() });
  const { data: docs } = useSuspenseQuery({ queryKey: ["documents"], queryFn: () => documentsService.list() });
  const docMap = Object.fromEntries(docs.map((d) => [d.id, d.title]));
  const [filter, setFilter] = useState<"all" | "answered" | "unanswered">("all");

  const filtered = history.filter((h) => {
    if (filter === "answered") return h.resultCount > 0;
    if (filter === "unanswered") return h.resultCount === 0;
    return true;
  });

  return (
    <Card>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold">{filtered.length} queries</h2>
        <div className="flex gap-1 rounded-md bg-muted p-0.5">
          {(["all","answered","unanswered"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium capitalize ${filter === f ? "bg-card shadow-sm" : "text-muted-foreground"}`}
            >{f}</button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<SearchIcon className="h-5 w-5" />} title="No searches" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-5 py-3">Query</th>
                <th className="text-left font-medium px-3 py-3">User</th>
                <th className="text-left font-medium px-3 py-3">Filters</th>
                <th className="text-right font-medium px-3 py-3">Results</th>
                <th className="text-left font-medium px-3 py-3">Clicked</th>
                <th className="text-right font-medium px-5 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((h) => (
                <tr key={h.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 font-medium">
                      <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      {h.query}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{h.user}</td>
                  <td className="px-3 py-3">
                    {Object.keys(h.filters).length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(h.filters).map(([k, v]) => (
                          <span key={k} className="rounded bg-secondary text-secondary-foreground px-1.5 py-0.5 text-[11px]">{k}: {v}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${h.resultCount === 0 ? "bg-warning/15 text-warning ring-warning/30" : "bg-muted text-muted-foreground ring-border"}`}>
                      {h.resultCount}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {h.clickedDocumentId ? (
                      <Link to="/documents/$id" params={{ id: h.clickedDocumentId }} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <MousePointerClick className="h-3 w-3" />
                        {docMap[h.clickedDocumentId] ?? h.clickedDocumentId}
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(h.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
