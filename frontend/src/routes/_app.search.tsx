import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import { Search as SearchIcon, FileText, Filter, X } from "lucide-react";
import { PageHeader, Card, StatusBadge, Tag, EmptyState } from "@/components/ui-kit";
import { documentsService, collectionsService } from "@/lib/services";
import { formatDate, timeAgo } from "@/lib/format";
import { popularSearches } from "@/lib/mock/data";

export const Route = createFileRoute("/_app/search")({
  component: SearchPage,
  head: () => ({ meta: [{ title: "Search · KnowledgeFlow AI" }] }),
});

function SearchPage() {
  return (
    <>
      <PageHeader title="Search" description="Keyword search across your indexed knowledge base." />
      <div className="p-6">
        <Suspense fallback={<Card className="h-96 animate-pulse" />}>
          <SearchBody />
        </Suspense>
      </div>
    </>
  );
}

function SearchBody() {
  const { data: docs } = useSuspenseQuery({ queryKey: ["documents"], queryFn: () => documentsService.list() });
  const { data: collections } = useSuspenseQuery({ queryKey: ["collections"], queryFn: () => collectionsService.list() });
  const [query, setQuery] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [department, setDepartment] = useState("");
  const [docType, setDocType] = useState("");
  const [tag, setTag] = useState("");

  const departments = useMemo(() => Array.from(new Set(docs.map((d) => d.department))).sort(), [docs]);
  const docTypes = useMemo(() => Array.from(new Set(docs.map((d) => d.documentType))).sort(), [docs]);
  const allTags = useMemo(() => Array.from(new Set(docs.flatMap((d) => d.tags))).sort(), [docs]);
  const collectionMap = useMemo(() => Object.fromEntries(collections.map((c) => [c.id, c.name])), [collections]);

  const searchParams = useMemo(() => ({
    q: query.trim() || undefined,
    collectionId: collectionId || undefined,
    department: department || undefined,
    documentType: docType || undefined,
    tag: tag || undefined
  }), [query, collectionId, department, docType, tag]);

  const { data: searchResults } = useQuery({
    queryKey: ["search", searchParams],
    queryFn: () => documentsService.list(searchParams),
    enabled: !!(query.trim() || collectionId || department || docType || tag)
  });

  const results = (query.trim() || collectionId || department || docType || tag) ? (searchResults ?? []) : [];

  const hasActive = !!(query.trim() || collectionId || department || docType || tag);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center gap-2 rounded-md border border-input bg-background pl-3 focus-within:ring-2 focus-within:ring-ring">
          <SearchIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SOPs, policies, runbooks, contracts…"
            className="flex-1 bg-transparent py-2.5 text-sm outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 mr-1 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Filter className="h-3 w-3" /> Filters:</span>
          <FilterSelect value={collectionId} onChange={setCollectionId} label="Collection" options={collections.map((c) => ({ value: c.id, label: c.name }))} />
          <FilterSelect value={department} onChange={setDepartment} label="Department" options={departments.map((d) => ({ value: d, label: d }))} />
          <FilterSelect value={docType} onChange={setDocType} label="Type" options={docTypes.map((d) => ({ value: d, label: d }))} />
          <FilterSelect value={tag} onChange={setTag} label="Tag" options={allTags.map((t) => ({ value: t, label: t }))} />
          {hasActive && (
            <button onClick={() => { setQuery(""); setCollectionId(""); setDepartment(""); setDocType(""); setTag(""); }} className="text-xs text-primary hover:underline">Clear all</button>
          )}
        </div>
      </Card>

      {!hasActive ? (
        <Card>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Trending searches</h2>
            <p className="text-xs text-muted-foreground">What your team is asking this week</p>
          </div>
          <ul className="divide-y divide-border">
            {popularSearches.map((s, i) => (
              <li key={i}>
                <button onClick={() => setQuery(s.query)} className="w-full text-left px-5 py-3 hover:bg-muted/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SearchIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{s.query}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{s.count} searches</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ) : results.length === 0 ? (
        <Card>
          <EmptyState
            icon={<SearchIcon className="h-5 w-5" />}
            title="No matching documents"
            description="Try a different query or remove filters."
          />
        </Card>
      ) : (
        <Card>
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">{results.length} {results.length === 1 ? "result" : "results"}</h2>
            <span className="text-xs text-muted-foreground">Ranked by relevance</span>
          </div>
          <ul className="divide-y divide-border">
            {results.map((d) => (
              <li key={d.id}>
                <Link to="/documents/$id" params={{ id: d.id }} className="block px-5 py-4 hover:bg-muted/40">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground hover:text-primary truncate">{d.title}</h3>
                        <StatusBadge status={d.status} />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {collectionMap[d.collectionId]} · {d.department} · {d.owner} · v{d.version} · {formatDate(d.uploadedAt)}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {d.tags.map((t) => <Tag key={t}>{t}</Tag>)}
                      </div>
                      {d.matchingSnippet && (
                        <div className="mt-2.5 rounded bg-muted/70 p-2.5 border-l-2 border-primary/45 font-mono text-[11px] text-foreground/90 whitespace-pre-wrap leading-relaxed">
                          {d.matchingSnippet}
                          {d.matchReason && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary uppercase tracking-wider">
                              {d.matchReason}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-[11px] text-muted-foreground whitespace-nowrap">
                      <div>{d.views} views</div>
                      <div>{timeAgo(d.uploadedAt)}</div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function FilterSelect({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-input bg-background px-2.5 h-8 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">{label}: any</option>
      {options.map((o) => <option key={o.value} value={o.value}>{label}: {o.label}</option>)}
    </select>
  );
}
