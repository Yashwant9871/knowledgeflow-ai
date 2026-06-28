import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Shield, Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui-kit";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in · KnowledgeFlow AI" },
      { name: "description", content: "Sign in to your KnowledgeFlow workspace." },
    ],
  }),
});

const DEMO_ACCOUNTS: { role: Role; email: string; name: string; hint: string }[] = [
  { role: "ADMIN", email: "sarah.chen@acme.com", name: "Sarah Chen", hint: "Full access · user & system management" },
  { role: "CONTENT_MANAGER", email: "marcus.okafor@acme.com", name: "Marcus Okafor", hint: "Manage collections & content" },
  { role: "EMPLOYEE", email: "daniel.weiss@acme.com", name: "Daniel Weiss", hint: "Search & view documents" },
];

function LoginPage() {
  const { login, session } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("sarah.chen@acme.com");
  const [password, setPassword] = useState("demo-password");
  const [selectedRole, setSelectedRole] = useState<Role>("ADMIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, selectedRole);
      navigate({ to: "/dashboard" });
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand side */}
      <div className="hidden lg:flex relative flex-col justify-between bg-sidebar text-sidebar-foreground p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(800px 400px at 20% 20%, oklch(0.55 0.18 265 / 0.5), transparent), radial-gradient(600px 400px at 80% 80%, oklch(0.6 0.13 230 / 0.4), transparent)" }} />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sidebar-primary/15 ring-1 ring-sidebar-primary/30">
              <Brain className="h-6 w-6 text-sidebar-primary" />
            </div>
            <div>
              <div className="text-base font-semibold text-white">KnowledgeFlow AI</div>
              <div className="text-xs uppercase tracking-wider text-sidebar-foreground/60">Enterprise Knowledge Management</div>
            </div>
          </div>
        </div>

        <div className="relative space-y-6 max-w-md">
          <h2 className="text-3xl font-semibold text-white leading-tight">
            Every policy, SOP, and runbook — one trusted source of truth.
          </h2>
          <p className="text-sidebar-foreground/70 leading-relaxed">
            Built for operations, HR, IT, finance, and quality teams who need to move fast without losing institutional knowledge.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              { icon: Shield, text: "SOC 2 Type II controls and immutable audit trails" },
              { icon: Lock, text: "Role-based access for SMB and mid-market teams" },
              { icon: Sparkles, text: "Smart indexing across PDFs, Word, and structured docs" },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <li key={i} className="flex items-start gap-3 text-sidebar-foreground/80">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar-accent">
                    <Icon className="h-3.5 w-3.5 text-sidebar-primary" />
                  </span>
                  {f.text}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative text-xs text-sidebar-foreground/40">
          © 2026 KnowledgeFlow AI · SOC 2 · ISO 27001
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="text-base font-semibold">KnowledgeFlow AI</div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Sign in to your workspace</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Welcome back. Enter your credentials to continue.</p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-foreground">Work email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-foreground">Password</label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot?</button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-foreground">Demo role</div>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    type="button"
                    key={acc.role}
                    onClick={() => {
                      setSelectedRole(acc.role);
                      setEmail(acc.email);
                    }}
                    className={`rounded-md border px-2 py-2 text-left transition-colors ${
                      selectedRole === acc.role
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <div className="text-[11px] font-semibold text-foreground">{acc.role.replace("_", " ")}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{acc.name}</div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {DEMO_ACCOUNTS.find((a) => a.role === selectedRole)?.hint}
              </p>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By signing in you accept our terms and acknowledge our privacy policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
