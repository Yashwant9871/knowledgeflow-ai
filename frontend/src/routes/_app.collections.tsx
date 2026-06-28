import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Users, Wallet, Package, Settings as SettingsIcon, Server, Shield, BadgeCheck, Scale, FolderOpen } from "lucide-react";
import { PageHeader, Card } from "@/components/ui-kit";
import { collectionsService } from "@/lib/services";

export const Route = createFileRoute("/_app/collections")({
  component: CollectionsPage,
  head: () => ({ meta: [{ title: "Collections · KnowledgeFlow AI" }] }),
});

const ICONS = { users: Users, wallet: Wallet, package: Package, settings: SettingsIcon, server: Server, shield: Shield, "badge-check": BadgeCheck, scale: Scale } as const;

function CollectionsPage() {
  return (
    <>
      <PageHeader title="Collections" description="Organize knowledge by department or function." />
      <div className="p-6">
        <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><Card key={i} className="h-44 animate-pulse"/>)}</div>}>
          <CollectionGrid />
        </Suspense>
      </div>
    </>
  );
}

function CollectionGrid() {
  const { data: collections } = useSuspenseQuery({ queryKey: ["collections"], queryFn: () => collectionsService.list() });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {collections.map((c) => {
        const Icon = ICONS[c.icon as keyof typeof ICONS] ?? FolderOpen;
        return (
          <Card key={c.id} className="p-5 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <AccessBadge level={c.accessLevel} />
            </div>
            <h3 className="mt-4 text-base font-semibold">{c.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-muted-foreground">Documents</dt>
                <dd className="font-semibold text-foreground text-sm mt-0.5">{c.documentCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Owner</dt>
                <dd className="font-medium text-foreground text-sm mt-0.5 truncate">{c.owner}</dd>
              </div>
            </dl>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-muted-foreground">Indexing health</span>
                <span className="font-mono font-medium">{c.indexingHealth}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${c.indexingHealth >= 95 ? "bg-success" : c.indexingHealth >= 85 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${c.indexingHealth}%` }} />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Last activity</span>
              <span className="font-medium text-foreground">{c.recentActivity}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function AccessBadge({ level }: { level: "OPEN" | "DEPARTMENT" | "RESTRICTED" }) {
  const map = {
    OPEN: { label: "Open", cls: "bg-success/15 text-success ring-success/30" },
    DEPARTMENT: { label: "Department", cls: "bg-info/15 text-info ring-info/30" },
    RESTRICTED: { label: "Restricted", cls: "bg-warning/15 text-warning ring-warning/30" },
  } as const;
  const v = map[level];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${v.cls}`}>{v.label}</span>;
}
