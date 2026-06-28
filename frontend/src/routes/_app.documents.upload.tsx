import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useRef, useState } from "react";
import { ArrowLeft, UploadCloud, FileText, X } from "lucide-react";
import { PageHeader, Card, Button, Tag } from "@/components/ui-kit";
import { collectionsService, usersService, documentsService } from "@/lib/services";
import { formatBytes } from "@/lib/format";
import type { Confidentiality } from "@/lib/types";

export const Route = createFileRoute("/_app/documents/upload")({
  component: UploadPage,
  head: () => ({ meta: [{ title: "Upload document · KnowledgeFlow AI" }] }),
});

function UploadPage() {
  return (
    <>
      <PageHeader
        title="Upload Document"
        description="Add a new document to the library. It will be queued for indexing automatically."
        actions={
          <Link to="/documents" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 h-9 text-sm font-medium hover:bg-muted">
            <ArrowLeft className="h-4 w-4" /> Back to library
          </Link>
        }
      />
      <div className="p-6">
        <Suspense fallback={<Card className="h-96 animate-pulse" />}>
          <UploadForm />
        </Suspense>
      </div>
    </>
  );
}

function UploadForm() {
  const navigate = useNavigate();
  const { data: collections } = useSuspenseQuery({ queryKey: ["collections"], queryFn: () => collectionsService.list() });
  const { data: users } = useSuspenseQuery({ queryKey: ["users"], queryFn: () => usersService.list() });

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [collectionId, setCollectionId] = useState(collections[0]?.id ?? "");
  const [department, setDepartment] = useState("HR");
  const [owner, setOwner] = useState(users[0]?.name ?? "");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [docType, setDocType] = useState("Policy");
  const [confidentiality, setConfidentiality] = useState<Confidentiality>("INTERNAL");
  const [expiry, setExpiry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title || file.name.split(".")[0]);
      formData.append("collection_id", collectionId);
      formData.append("department", department);
      formData.append("owner", owner);
      formData.append("tags", JSON.stringify(tags));
      formData.append("version", "1.0");
      formData.append("document_type", docType);
      formData.append("confidentiality", confidentiality);
      if (expiry) {
        formData.append("expiry_date", expiry);
      }

      await documentsService.upload(formData);
      navigate({ to: "/documents" });
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Source file</h2>
            <p className="text-xs text-muted-foreground">PDF, DOCX, XLSX, PPTX, or Markdown. Max 100 MB.</p>
          </div>
          <div className="p-5">
            {!file ? (
              <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) setFile(f);
                }}
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
                  dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                    if (f && !title) {
                      setTitle(f.name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium">Drop a file or click to browse</div>
                <div className="text-xs text-muted-foreground mt-1">Drag and drop your document here</div>
              </label>
            ) : (
              <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{formatBytes(file.size)}</div>
                </div>
                <Button variant="ghost" size="sm" type="button" onClick={() => setFile(null)}>Remove</Button>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Document details</h2>
            <p className="text-xs text-muted-foreground">Metadata is used for search, access, and lifecycle.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
            <Field label="Title" required className="sm:col-span-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Remote Work Policy 2026" className={inputCls} />
            </Field>
            <Field label="Collection" required>
              <select value={collectionId} onChange={(e) => setCollectionId(e.target.value)} className={inputCls}>
                {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Department" required>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls}>
                {["HR","Finance","Procurement","Operations","IT","Quality","Legal","Engineering"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Owner" required>
              <select value={owner} onChange={(e) => setOwner(e.target.value)} className={inputCls}>
                {users.map((u) => <option key={u.id}>{u.name}</option>)}
              </select>
            </Field>
            <Field label="Document type">
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className={inputCls}>
                {["Policy","SOP","Runbook","Manual","Contract","Template","Guideline","Standard","Report","Checklist","Process","Reference"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Confidentiality">
              <select value={confidentiality} onChange={(e) => setConfidentiality(e.target.value as Confidentiality)} className={inputCls}>
                <option value="PUBLIC">Public</option>
                <option value="INTERNAL">Internal</option>
                <option value="CONFIDENTIAL">Confidential</option>
                <option value="RESTRICTED">Restricted</option>
              </select>
            </Field>
            <Field label="Expiry / review date">
              <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Tags" className="sm:col-span-2">
              <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-2 min-h-9">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded bg-secondary text-secondary-foreground px-2 py-0.5 text-xs">
                    {t}
                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
                  }}
                  onBlur={addTag}
                  placeholder="Add tag and press Enter"
                  className="flex-1 min-w-[140px] bg-transparent text-sm outline-none"
                />
              </div>
            </Field>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Preview</h2>
          </div>
          <div className="p-5 space-y-3 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Title</div>
              <div className="font-medium">{title || "Untitled document"}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Collection · Department</div>
              <div>{collections.find((c) => c.id === collectionId)?.name} · {department}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Owner</div>
              <div>{owner}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Confidentiality</div>
              <div>{confidentiality}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Tags</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.length ? tags.map((t) => <Tag key={t}>{t}</Tag>) : <span className="text-xs text-muted-foreground">No tags</span>}
              </div>
            </div>
          </div>
        </Card>
        <div className="flex items-center justify-end gap-2">
          <Link to="/documents"><Button type="button" variant="ghost">Cancel</Button></Link>
          <Button type="submit" disabled={!file || !title || submitting}>
            {submitting ? "Uploading…" : "Upload & queue indexing"}
          </Button>
        </div>
      </div>
    </form>
  );
}

const inputCls = "w-full rounded-md border border-input bg-background px-3 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={"space-y-1.5 " + className}>
      <label className="text-xs font-medium text-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
