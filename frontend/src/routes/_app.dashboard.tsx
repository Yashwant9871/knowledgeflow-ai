import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import {
  FileText,
  FolderOpen,
  Clock,
  Database,
  TrendingUp,
  AlertTriangle,
  Upload,
  Search,
} from "lucide-react";
import { PageHeader, StatCard, Card, StatusBadge, LoadingRows } from "@/components/ui-kit";
import { analyticsService } from "@/lib/services";
import { formatBytes, timeAgo } from "@/lib/format";
import { mockCollections } from "@/lib/mock/data";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard · KnowledgeFlow AI" }] }),
});

const dashQuery = {
  queryKey: ["dashboard"] as const,
  queryFn: () => analyticsService.dashboard(),
};

function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your knowledge base health, activity, and search performance."
        actions={
          <>
            <Link to="/search" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 h-9 text-sm font-medium hover:bg-muted">
              <Search className="h-4 w-4" /> Search
            </Link>
            <Link to="/documents/upload" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 h-9 text-sm font-medium hover:bg-primary/90 shadow-sm">
              <Upload className="h-4 w-4" /> Upload document
            </Link>
          </>
        }
      />
      <div className="p-6">
        <Suspense fallback={<div className="space-y-4"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=><div key={i} className="surface-card h-28 animate-pulse"/>)}</div></div>}>
          <DashboardContent />
        </Suspense>
      </div>
    </>
  );
}

function DashboardContent() {
  const { data } = useSuspenseQuery(dashQuery);
  const storagePct = Math.round((data.storageBytes / data.storageQuotaBytes) * 100);
  const [activeSubTab, setActiveSubTab] = useState<"uploads" | "indexed">("uploads");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total documents" value={data.totalDocs} hint={`${data.indexed} indexed`} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Collections" value={data.collections} hint="Across 8 departments" icon={<FolderOpen className="h-5 w-5" />} tone="info" />
        <StatCard label="Pending indexing" value={data.pending} hint={data.pending === 0 ? "All up to date" : "In queue"} icon={<Clock className="h-5 w-5" />} tone="warning" />
        <StatCard label="Total chunks" value={data.totalChunks || 0} hint="Enterprise chunks" icon={<Database className="h-5 w-5" />} tone="info" />
        <StatCard label="Needs review" value={data.needsReview} hint="Action required" icon={<AlertTriangle className="h-5 w-5" />} tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveSubTab("uploads")}
                className={`text-xs font-semibold pb-1.5 border-b-2 transition-all ${
                  activeSubTab === "uploads" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Recent uploads
              </button>
              <button
                onClick={() => setActiveSubTab("indexed")}
                className={`text-xs font-semibold pb-1.5 border-b-2 transition-all ${
                  activeSubTab === "indexed" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Recently indexed
              </button>
            </div>
            <Link to="/documents" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-border">
            {(activeSubTab === "uploads" ? data.recentUploads : data.recentlyIndexed || []).map((d) => (
              <li key={d.id}>
                <Link
                  to="/documents/$id"
                  params={{ id: d.id }}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{d.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {d.department} · {d.owner} · {timeAgo(d.uploadedAt)}
                    </div>
                  </div>
                  <StatusBadge status={d.status} />
                </Link>
              </li>
            ))}
            {(activeSubTab === "uploads" ? data.recentUploads : data.recentlyIndexed || []).length === 0 && (
              <div className="p-8 text-center text-xs text-muted-foreground">No documents in this list.</div>
            )}
          </ul>
        </Card>


        <Card>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Storage</h2>
            <p className="text-xs text-muted-foreground">{formatBytes(data.storageBytes)} of {formatBytes(data.storageQuotaBytes)}</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-medium">Usage</span>
                <span className="text-muted-foreground">{storagePct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(2, storagePct)}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-md bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" /> Active users
                </div>
                <div className="mt-1.5 text-xl font-semibold">{data.activeUsers7d}</div>
                <div className="text-[11px] text-muted-foreground">in last 7 days</div>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Database className="h-3.5 w-3.5" /> Indexed
                </div>
                <div className="mt-1.5 text-xl font-semibold">{Math.round((data.indexed / data.totalDocs) * 100)}%</div>
                <div className="text-[11px] text-muted-foreground">of total library</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Popular searches</h2>
            <Link to="/search-history" className="text-xs font-medium text-primary hover:underline">All history</Link>
          </div>
          <ul className="divide-y divide-border">
            {data.popularSearches.map((s, i) => (
              <li key={i} className="flex items-center justify-between px-5 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-muted-foreground w-5">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm">{s.query}</span>
                </div>
                <span className="text-xs text-muted-foreground">{s.count} searches</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Unanswered searches</h2>
              <p className="text-xs text-muted-foreground">Knowledge gaps to address</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 text-warning ring-1 ring-warning/30 px-2 py-0.5 text-[11px] font-medium">
              {data.unansweredSearches.length} open
            </span>
          </div>
          <ul className="divide-y divide-border">
            {data.unansweredSearches.map((s, i) => (
              <li key={i} className="flex items-center justify-between px-5 py-2.5">
                <div>
                  <div className="text-sm">{s.query}</div>
                  <div className="text-[11px] text-muted-foreground">Last asked {timeAgo(s.lastAsked)}</div>
                </div>
                <span className="text-xs text-warning font-medium">{s.count}× asked</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Collection health</h2>
          <p className="text-xs text-muted-foreground">Indexing coverage per collection</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          {mockCollections.map((c) => (
            <Link key={c.id} to="/collections" className="rounded-md border border-border p-3 hover:bg-muted/40 transition-colors">
              <div className="text-sm font-medium truncate">{c.name}</div>
              <div className="text-[11px] text-muted-foreground">{c.documentCount} docs</div>
              <div className="mt-2.5 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${c.indexingHealth >= 95 ? "bg-success" : c.indexingHealth >= 85 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${c.indexingHealth}%` }} />
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{c.indexingHealth}% indexed</div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Re-export for completeness; not used directly
export { LoadingRows };
