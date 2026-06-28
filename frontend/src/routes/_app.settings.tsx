import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Database, FolderOpen, Cpu, Shield } from "lucide-react";
import { PageHeader, Card, Button } from "@/components/ui-kit";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings · KnowledgeFlow AI" }] }),
});

const SECTIONS = [
  { id: "general", label: "General", icon: Building2 },
  { id: "retention", label: "Document retention", icon: Database },
  { id: "collections", label: "Collection settings", icon: FolderOpen },
  { id: "indexing", label: "Indexing", icon: Cpu },
  { id: "security", label: "Security", icon: Shield },
] as const;

function SettingsPage() {
  const [active, setActive] = useState<(typeof SECTIONS)[number]["id"]>("general");
  return (
    <>
      <PageHeader title="Settings" description="Configure workspace-wide preferences and policies." />
      <div className="p-6 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <Card className="p-2 h-fit">
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                    active === s.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </Card>

        <div>
          {active === "general" && <GeneralSection />}
          {active === "retention" && <RetentionSection />}
          {active === "collections" && <CollectionsSection />}
          {active === "indexing" && <IndexingSection />}
          {active === "security" && <SecuritySection />}
        </div>
      </div>
    </>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="p-6 space-y-5">{children}</div>
      <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-2">
        <Button variant="ghost">Reset</Button>
        <Button>Save changes</Button>
      </div>
    </Card>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

const inputCls = "w-full rounded-md border border-input bg-background px-3 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function GeneralSection() {
  return (
    <Section title="General" description="Workspace name, branding, and locale.">
      <Row label="Workspace name"><input defaultValue="Acme Industries" className={inputCls} /></Row>
      <Row label="Primary domain"><input defaultValue="acme.com" className={inputCls} /></Row>
      <Row label="Default language">
        <select className={inputCls}><option>English (US)</option><option>English (UK)</option><option>Deutsch</option><option>Français</option></select>
      </Row>
      <Row label="Timezone">
        <select className={inputCls}><option>America/New_York</option><option>Europe/London</option><option>Asia/Singapore</option></select>
      </Row>
    </Section>
  );
}

function RetentionSection() {
  return (
    <Section title="Document retention" description="Lifecycle policies for archived and expired documents.">
      <Row label="Auto-archive after" hint="Documents marked stale are archived automatically."><input type="number" defaultValue={365} className={inputCls + " max-w-[160px]"} /> <span className="text-xs text-muted-foreground ml-2">days</span></Row>
      <Row label="Review reminder lead time" hint="Notify owners before expiry date."><input type="number" defaultValue={30} className={inputCls + " max-w-[160px]"} /> <span className="text-xs text-muted-foreground ml-2">days</span></Row>
      <Row label="Hard-delete archived" hint="Permanently remove after this period."><input type="number" defaultValue={1095} className={inputCls + " max-w-[160px]"} /> <span className="text-xs text-muted-foreground ml-2">days</span></Row>
    </Section>
  );
}

function CollectionsSection() {
  return (
    <Section title="Collection defaults" description="Default access and approval requirements for new collections.">
      <Row label="Default access level">
        <select className={inputCls}><option>Department</option><option>Open</option><option>Restricted</option></select>
      </Row>
      <Row label="Require approval to upload"><Toggle defaultOn={true} /></Row>
      <Row label="Allow employee tag suggestions"><Toggle defaultOn={true} /></Row>
    </Section>
  );
}

function IndexingSection() {
  return (
    <Section title="Indexing" description="Knowledge ingestion and indexing configuration (backend integration pending).">
      <Row label="Indexing engine" hint="Connect to your FastAPI indexing pipeline."><input defaultValue="https://api.acme.com/v1/index" className={inputCls} /></Row>
      <Row label="Re-index cadence">
        <select className={inputCls}><option>Real-time</option><option>Hourly</option><option>Daily</option><option>Manual</option></select>
      </Row>
      <Row label="Status">
        <span className="inline-flex items-center gap-2 rounded-full bg-warning/15 text-warning ring-1 ring-warning/30 px-2.5 py-1 text-xs font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-current" /> Awaiting backend connection
        </span>
      </Row>
    </Section>
  );
}

function SecuritySection() {
  return (
    <Section title="Security" description="Sign-in, session, and access controls.">
      <Row label="Single sign-on">
        <select className={inputCls}><option>Disabled</option><option>SAML 2.0</option><option>OIDC</option></select>
      </Row>
      <Row label="Require 2FA for admins"><Toggle defaultOn={true} /></Row>
      <Row label="Session timeout"><input type="number" defaultValue={60} className={inputCls + " max-w-[160px]"} /> <span className="text-xs text-muted-foreground ml-2">minutes</span></Row>
      <Row label="IP allowlist" hint="Comma-separated CIDRs"><input defaultValue="" placeholder="e.g. 10.0.0.0/16, 192.168.1.0/24" className={inputCls} /></Row>
    </Section>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} type="button" className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}
