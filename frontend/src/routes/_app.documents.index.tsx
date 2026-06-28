import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import { FileText, Upload, Download, Eye, Filter } from "lucide-react";
import { PageHeader, Card, StatusBadge, Tag, EmptyState, Button } from "@/components/ui-kit";
import { documentsService, collectionsService } from "@/lib/services";
import { formatBytes, formatDate } from "@/lib/format";
import type { DocumentStatus } from "@/lib/types";

export const Route = createFileRoute("/_app/documents/")({
  component: DocumentsPage,
  head: () => ({ meta: [{ title: "Documents · KnowledgeFlow AI" }] }),
});

function DocumentsPage() {
  return (
    <>
      <PageHeader
        title="Document Library"
        description="Browse, filter, and manage every document indexed in your workspace."
        actions={
          <Link to="/documents/upload" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 h-9 text-sm font-medium hover:bg-primary/90 shadow-sm">
            <Upload className="h-4 w-4" /> Upload document
          </Link>
        }
      />
      <div className="p-6">
        <Suspense fallback={<Card className="h-96 animate-pulse" />}>
          <DocumentsTable />
        </Suspense>
      </div>
    </>
  );
}

function DocumentsTable() {
  const { data: docs } = useSuspenseQuery({ queryKey: ["documents"], queryFn: () => documentsService.list() });
  const { data: collections } = useSuspenseQuery({ queryKey: ["collections"], queryFn: () => collectionsService.list() });
  const [query, setQuery] = useState("");
  const [collectionId, setCollectionId] = useState<string>("");
  const [status, setStatus] = useState<DocumentStatus | "">("");
  const [dept, setDept] = useState<string>("");

  const departments = useMemo(() => Array.from(new Set(docs.map((d) => d.department))).sort(), [docs]);
  const collectionMap = useMemo(() => Object.fromEntries(collections.map((c) => [c.id, c.name])), [collections]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return docs.filter((d) => {
      if (q && !`${d.title} ${d.tags.join(" ")} ${d.owner}`.toLowerCase().includes(q)) return false;
      if (collectionId && d.collectionId !== collectionId) return false;
      if (status && d.status !== status) return false;
      if (dept && d.department !== dept) return false;
      return true;
    });
  }, [docs, query, collectionId, status, dept]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[220px]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, tag, or owner…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Select value={collectionId} onChange={setCollectionId} placeholder="All collections" options={[{ value: "", label: "All collections" }, ...collections.map((c) => ({ value: c.id, label: c.name }))]} />
          <Select value={dept} onChange={setDept} placeholder="All departments" options={[{ value: "", label: "All departments" }, ...departments.map((d) => ({ value: d, label: d }))]} />
          <Select
            value={status}
            onChange={(v) => setStatus(v as DocumentStatus | "")}
            options={[
              { value: "", label: "Any status" },
              { value: "UPLOADED", label: "Uploaded" },
              { value: "INDEXING_PENDING", label: "Indexing" },
              { value: "INDEXED", label: "Indexed" },
              { value: "NEEDS_REVIEW", label: "Needs review" },
              { value: "ARCHIVED", label: "Archived" },
            ]}
          />
          {(query || collectionId || status || dept) && (
            <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setCollectionId(""); setStatus(""); setDept(""); }}>Clear</Button>
          )}
          <div className="ml-auto text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" /> {filtered.length} of {docs.length} documents
          </div>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="No documents match these filters"
            description="Try clearing filters or uploading a new document."
            action={<Link to="/documents/upload"><Button>Upload document</Button></Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Title</th>
                  <th className="text-left font-medium px-3 py-3">Collection</th>
                  <th className="text-left font-medium px-3 py-3">Department</th>
                  <th className="text-left font-medium px-3 py-3">Owner</th>
                  <th className="text-left font-medium px-3 py-3">Version</th>
                  <th className="text-left font-medium px-3 py-3">Status</th>
                  <th className="text-left font-medium px-3 py-3">Type</th>
                  <th className="text-right font-medium px-3 py-3">Activity</th>
                  <th className="text-right font-medium px-5 py-3">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <Link to="/documents/$id" params={{ id: d.id }} className="block">
                        <div className="font-medium text-foreground hover:text-primary truncate max-w-[280px]">{d.title}</div>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {d.tags.slice(0, 3).map((t) => <Tag key={t}>{t}</Tag>)}
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{collectionMap[d.collectionId] ?? d.collectionId}</td>
                    <td className="px-3 py-3 text-muted-foreground">{d.department}</td>
                    <td className="px-3 py-3 text-muted-foreground">{d.owner}</td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">v{d.version}</td>
                    <td className="px-3 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-3 py-3 text-muted-foreground">
                      <span className="inline-flex items-center rounded bg-secondary text-secondary-foreground text-[11px] px-1.5 py-0.5 font-mono">{d.fileType}</span>
                      <span className="ml-2 text-xs">{formatBytes(d.fileSize)}</span>
                    </td>
                    <td className="px-3 py-3 text-right text-xs text-muted-foreground">
                      <div className="inline-flex items-center gap-3">
                        <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{d.views}</span>
                        <span className="inline-flex items-center gap-1"><Download className="h-3 w-3" />{d.downloads}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">{formatDate(d.uploadedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Select<T extends string>({ value, onChange, options, placeholder }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; placeholder?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-md border border-input bg-background px-3 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[140px]"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
