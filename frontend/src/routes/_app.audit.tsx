import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { Upload, Eye, Download, Pencil, ShieldCheck, FolderEdit, Archive, CheckCircle2 } from "lucide-react";
import { PageHeader, Card } from "@/components/ui-kit";
import { activityService } from "@/lib/services";
import { formatDateTime, timeAgo } from "@/lib/format";
import type { ActivityEvent } from "@/lib/types";

export const Route = createFileRoute("/_app/audit")({
  component: AuditPage,
  head: () => ({ meta: [{ title: "Audit log · KnowledgeFlow AI" }] }),
});

const ICON_MAP = {
  UPLOAD: Upload,
  VIEW: Eye,
  DOWNLOAD: Download,
  METADATA_EDIT: Pencil,
  PERMISSION_CHANGE: ShieldCheck,
  COLLECTION_UPDATE: FolderEdit,
  ARCHIVE: Archive,
  INDEX_COMPLETE: CheckCircle2,
} as const;

const TONE: Record<ActivityEvent["type"], string> = {
  UPLOAD: "bg-primary/10 text-primary",
  VIEW: "bg-muted text-muted-foreground",
  DOWNLOAD: "bg-info/15 text-info",
  METADATA_EDIT: "bg-warning/15 text-warning",
  PERMISSION_CHANGE: "bg-destructive/15 text-destructive",
  COLLECTION_UPDATE: "bg-info/15 text-info",
  ARCHIVE: "bg-muted text-muted-foreground",
  INDEX_COMPLETE: "bg-success/15 text-success",
};

function AuditPage() {
  return (
    <>
      <PageHeader title="Audit Log" description="Immutable record of every action taken in the workspace." />
      <div className="p-6">
        <Suspense fallback={<Card className="h-96 animate-pulse" />}>
          <AuditTimeline />
        </Suspense>
      </div>
    </>
  );
}

function AuditTimeline() {
  const { data: events } = useSuspenseQuery({ queryKey: ["audit"], queryFn: () => activityService.list() });
  const [typeFilter, setTypeFilter] = useState<ActivityEvent["type"] | "">("");
  const filtered = typeFilter ? events.filter((e) => e.type === typeFilter) : events;

  const types = Array.from(new Set(events.map((e) => e.type)));

  return (
    <Card>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold">{filtered.length} events</h2>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ActivityEvent["type"] | "")}
          className="rounded-md border border-input bg-background px-2.5 h-8 text-xs"
        >
          <option value="">All event types</option>
          {types.map((t) => <option key={t} value={t}>{t.replace("_"," ")}</option>)}
        </select>
      </div>

      <ol className="relative">
        {filtered.map((e, i) => {
          const Icon = ICON_MAP[e.type];
          return (
            <li key={e.id} className="relative px-5 py-4 flex gap-4 border-b border-border last:border-b-0">
              <div className="relative flex flex-col items-center">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${TONE[e.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {i < filtered.length - 1 && <div className="flex-1 w-px bg-border mt-1" />}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-sm">
                    <span className="font-medium">{e.actor}</span>{" "}
                    <span className="text-muted-foreground">{verb(e.type)}</span>{" "}
                    <span className="font-medium">{e.target}</span>
                  </div>
                  <div className="text-xs text-muted-foreground" title={formatDateTime(e.timestamp)}>{timeAgo(e.timestamp)}</div>
                </div>
                {e.detail && <div className="mt-1 text-xs text-muted-foreground">{e.detail}</div>}
                <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-mono">{e.type.replace("_"," ")}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function verb(t: ActivityEvent["type"]): string {
  switch (t) {
    case "UPLOAD": return "uploaded";
    case "VIEW": return "viewed";
    case "DOWNLOAD": return "downloaded";
    case "METADATA_EDIT": return "edited metadata for";
    case "PERMISSION_CHANGE": return "changed permissions on";
    case "COLLECTION_UPDATE": return "updated collection";
    case "ARCHIVE": return "archived";
    case "INDEX_COMPLETE": return "finished indexing";
  }
}
