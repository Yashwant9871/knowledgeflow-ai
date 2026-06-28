import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { ArrowLeft, Download, FileText, Eye, Search as SearchIcon, History, ExternalLink, Cpu } from "lucide-react";
import { PageHeader, Card, StatusBadge, Tag, Button } from "@/components/ui-kit";
import { documentsService, collectionsService } from "@/lib/services";
import { formatBytes, formatDate, timeAgo } from "@/lib/format";
import { mockActivity } from "@/lib/mock/data";
import { useIndexing } from "@/hooks/useIndexing";
import { useDocumentChunks } from "@/hooks/useDocumentChunks";

export const Route = createFileRoute("/_app/documents/$id")({
  component: DocumentDetail,
  head: () => ({ meta: [{ title: "Document · KnowledgeFlow AI" }] }),
});

function DocumentDetail() {
  const { id } = Route.useParams();
  return (
    <Suspense fallback={<div className="p-6"><Card className="h-96 animate-pulse" /></div>}>
      <DetailContent id={id} />
    </Suspense>
  );
}

function DetailContent({ id }: { id: string }) {
  const { data: doc } = useSuspenseQuery({ queryKey: ["document", id], queryFn: () => documentsService.get(id) });
  const { data: collections } = useSuspenseQuery({ queryKey: ["collections"], queryFn: () => collectionsService.list() });
  const { data: all } = useSuspenseQuery({ queryKey: ["documents"], queryFn: () => documentsService.list() });

  const [activeTab, setActiveTab] = useState<"preview" | "text" | "chunks">("preview");

  if (!doc) throw notFound();

  // Query indexing and chunk values
  const { status: idxStatus, reindex, isReindexing } = useIndexing(doc.id);
  const { data: chunks } = useDocumentChunks(doc.id);

  const collection = collections.find((c) => c.id === doc.collectionId);
  const related = doc.relatedDocumentIds.map((rid) => all.find((d) => d.id === rid)).filter(Boolean);
  const activity = mockActivity.filter((a) => a.targetId === doc.id);

  const handleDownload = () => {
    try {
      const sessionRaw = window.localStorage.getItem("kf_session_v1");
      const token = sessionRaw ? JSON.parse(sessionRaw).token : "";
      window.open(`http://localhost:8000/api/v1/documents/${doc.id}/download?token=${token}`, "_blank");
    } catch (e) {
      console.error(e);
    }
  };

  const sessionRaw = window.localStorage.getItem("kf_session_v1");
  const userRole = sessionRaw ? JSON.parse(sessionRaw).role : "EMPLOYEE";
  const canReindex = userRole === "ADMIN" || userRole === "CONTENT_MANAGER";

  return (
    <>
      <PageHeader
        title={doc.title}
        description={`${collection?.name ?? doc.collectionId} · ${doc.department} · Owned by ${doc.owner}`}
        actions={
          <>
            <Link to="/documents" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 h-9 text-sm font-medium hover:bg-muted">
              <ArrowLeft className="h-4 w-4" /> Library
            </Link>
            <Button onClick={handleDownload}><Download className="h-4 w-4" /> Download</Button>
          </>
        }
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="px-5 py-2 border-b border-border flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`text-xs font-semibold px-2 py-1.5 border-b-2 transition-all ${
                    activeTab === "preview" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  File Preview
                </button>
                <button
                  onClick={() => setActiveTab("text")}
                  className={`text-xs font-semibold px-2 py-1.5 border-b-2 transition-all ${
                    activeTab === "text" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Extracted Text ({doc.extractedText ? `${Math.round(doc.extractedText.length / 1000)}k chars` : "0"})
                </button>
                <button
                  onClick={() => setActiveTab("chunks")}
                  className={`text-xs font-semibold px-2 py-1.5 border-b-2 transition-all ${
                    activeTab === "chunks" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Chunks ({chunks?.length ?? 0})
                </button>
              </div>
              <StatusBadge status={doc.status} />
            </div>

            {activeTab === "preview" && (
              <div className="aspect-[16/10] bg-gradient-to-br from-muted/40 to-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-card shadow-sm">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="mt-3 text-sm font-medium">{doc.fileType} preview</div>
                  <div className="text-xs text-muted-foreground">{formatBytes(doc.fileSize)} · {doc.fileType}</div>
                  <Button variant="outline" size="sm" className="mt-4" onClick={handleDownload}>
                    <ExternalLink className="h-3.5 w-3.5" /> Open full document
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "text" && (
              <div className="p-5">
                <div className="max-h-[350px] overflow-y-auto font-mono text-[11px] leading-relaxed text-foreground bg-muted/30 border border-input rounded-md p-4 whitespace-pre-wrap select-text">
                  {doc.extractedText || "No text extracted yet. Run indexing pipeline to extract content."}
                </div>
              </div>
            )}

            {activeTab === "chunks" && (
              <div className="divide-y divide-border max-h-[390px] overflow-y-auto">
                {!chunks || chunks.length === 0 ? (
                  <div className="p-5 text-center text-xs text-muted-foreground">No chunks created. Reindex to generate text chunks.</div>
                ) : (
                  chunks.map((chunk) => (
                    <div key={chunk.id} className="p-4 space-y-1.5 text-left">
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                        <span>CHUNK #{chunk.chunkIndex + 1}</span>
                        <span className="font-mono">{chunk.characterCount} chars</span>
                      </div>
                      <p className="text-xs text-foreground bg-muted/40 p-2.5 rounded font-mono select-text leading-relaxed">{chunk.chunkText}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>


          <Card>
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold">Version history</h2>
            </div>
            <ul className="divide-y divide-border">
              {doc.versions.map((v, i) => (
                <li key={v.version} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-mono">v{v.version}</span>
                    <div>
                      <div className="text-sm font-medium">{v.notes}</div>
                      <div className="text-xs text-muted-foreground">{v.uploadedBy} · {formatDate(v.uploadedAt)}</div>
                    </div>
                  </div>
                  {i === 0 ? (
                    <span className="text-[11px] rounded-full bg-success/15 text-success px-2 py-0.5 ring-1 ring-success/30">Current</span>
                  ) : (
                    <Button variant="ghost" size="sm">Restore</Button>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold">Activity timeline</h2>
            </div>
            {activity.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No activity yet for this document.</div>
            ) : (
              <ul className="divide-y divide-border">
                {activity.map((a) => (
                  <li key={a.id} className="px-5 py-3 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <History className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1">
                      <div className="text-sm"><span className="font-medium">{a.actor}</span> <span className="text-muted-foreground">· {a.type.replace("_"," ").toLowerCase()}</span></div>
                      {a.detail && <div className="text-xs text-muted-foreground">{a.detail}</div>}
                    </div>
                    <div className="text-xs text-muted-foreground">{timeAgo(a.timestamp)}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold inline-flex items-center gap-1.5"><Cpu className="h-4 w-4 text-primary" /> Intelligence</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                doc.status === "INDEXED" ? "bg-success/15 text-success ring-1 ring-success/30" :
                doc.status === "INDEXING" ? "bg-primary/15 text-primary ring-1 ring-primary/30 animate-pulse" :
                doc.status === "NEEDS_REVIEW" ? "bg-warning/15 text-warning ring-1 ring-warning/30" :
                doc.status === "INDEXING_FAILED" ? "bg-destructive/15 text-destructive ring-1 ring-destructive/30" :
                "bg-muted text-muted-foreground"
              }`}>
                {doc.status}
              </span>
            </div>
            <div className="px-5 py-4 space-y-3.5">
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Extraction Status:</span>
                  <span className="font-semibold text-foreground">{idxStatus?.extractionStatus || doc.extractionStatus || "PENDING"}</span>
                </div>
                {(idxStatus?.extractionMethod || doc.extractionMethod) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Extraction Method:</span>
                    <span className="font-semibold text-foreground">{idxStatus?.extractionMethod || doc.extractionMethod}</span>
                  </div>
                )}
                {(idxStatus?.extractedAt || doc.extractedAt) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Indexed At:</span>
                    <span className="font-semibold text-foreground">{formatDate(idxStatus?.extractedAt || doc.extractedAt)}</span>
                  </div>
                )}
                {(idxStatus?.extractionError || doc.extractionError) && (
                  <div className="rounded border border-destructive/20 bg-destructive/5 p-2 px-2.5 font-mono text-[10px] text-destructive leading-normal whitespace-pre-wrap">
                    Error: {idxStatus?.extractionError || doc.extractionError}
                  </div>
                )}
              </div>
              {canReindex && (
                <Button
                  onClick={() => reindex()}
                  disabled={isReindexing || doc.status === "INDEXING"}
                  className="w-full text-xs py-1.5 h-8"
                  variant="outline"
                >
                  {isReindexing || doc.status === "INDEXING" ? "Indexing..." : "Reindex Document"}
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold">Metadata</h2>
            </div>
            <dl className="divide-y divide-border text-sm">
              <Meta label="Version" value={`v${doc.version}`} />
              <Meta label="Document type" value={doc.documentType} />
              <Meta label="Confidentiality" value={doc.confidentiality} />
              <Meta label="File" value={`${doc.fileType} · ${formatBytes(doc.fileSize)}`} />
              <Meta label="Uploaded" value={formatDate(doc.uploadedAt)} />
              {doc.expiryDate && <Meta label="Review by" value={formatDate(doc.expiryDate)} />}
              <Meta label="Views" value={String(doc.views)} icon={<Eye className="h-3.5 w-3.5" />} />
              <Meta label="Downloads" value={String(doc.downloads)} icon={<Download className="h-3.5 w-3.5" />} />
              <Meta label="Search appearances" value={String(doc.searchAppearances)} icon={<SearchIcon className="h-3.5 w-3.5" />} />
            </dl>
            <div className="px-5 py-4 border-t border-border">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {doc.tags.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold">Permissions</h2>
            </div>
            <ul className="divide-y divide-border text-sm">
              {doc.permissions.map((p) => (
                <li key={p.role} className="px-5 py-3 flex items-center justify-between">
                  <span className="font-medium">{p.role.replace("_"," ")}</span>
                  <span className="text-xs rounded bg-secondary text-secondary-foreground px-2 py-0.5">{p.access}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold">Related documents</h2>
            </div>
            {related.length === 0 ? (
              <div className="px-5 py-6 text-sm text-muted-foreground">No related documents.</div>
            ) : (
              <ul className="divide-y divide-border">
                {related.map((d) => d && (
                  <li key={d.id}>
                    <Link to="/documents/$id" params={{ id: d.id }} className="block px-5 py-3 hover:bg-muted/40">
                      <div className="text-sm font-medium truncate">{d.title}</div>
                      <div className="text-xs text-muted-foreground">v{d.version} · {d.fileType}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function Meta({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <dt className="text-xs text-muted-foreground inline-flex items-center gap-1.5">{icon}{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
