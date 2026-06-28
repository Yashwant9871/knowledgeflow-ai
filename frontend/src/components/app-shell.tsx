import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Search,
  FileText,
  FolderOpen,
  History,
  Shield,
  Users,
  Settings,
  Brain,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/format";
import type { Role } from "@/lib/types";

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
  exact?: boolean;
}

const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Search", to: "/search", icon: Search },
  { label: "Documents", to: "/documents", icon: FileText },
  { label: "Collections", to: "/collections", icon: FolderOpen },
];

const INSIGHTS_NAV: NavItem[] = [
  { label: "Search History", to: "/search-history", icon: History },
  { label: "Audit Log", to: "/audit", icon: Shield, roles: ["ADMIN", "CONTENT_MANAGER"] },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Users", to: "/users", icon: Users, roles: ["ADMIN"] },
  { label: "Settings", to: "/settings", icon: Settings, roles: ["ADMIN"] },
];

function NavGroup({ label, items, currentRole, pathname }: { label: string; items: NavItem[]; currentRole: Role; pathname: string }) {
  const visible = items.filter((i) => !i.roles || i.roles.includes(currentRole));
  if (!visible.length) return null;
  return (
    <div className="px-3 pb-2">
      <div className="px-3 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
        {label}
      </div>
      <ul className="space-y-0.5">
        {visible.map((item) => {
          const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")
                }
              >
                <Icon className={"h-4 w-4 " + (active ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground")} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  if (!session) return null;
  const user = session.user;

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary/15 ring-1 ring-sidebar-primary/30">
            <Brain className="h-5 w-5 text-sidebar-primary" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">KnowledgeFlow</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">AI · Enterprise</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <NavGroup label="Workspace" items={PRIMARY_NAV} currentRole={user.role} pathname={pathname} />
          <NavGroup label="Insights" items={INSIGHTS_NAV} currentRole={user.role} pathname={pathname} />
          <NavGroup label="Administration" items={ADMIN_NAV} currentRole={user.role} pathname={pathname} />
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-md bg-sidebar-accent/40 p-3">
            <div className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50">Workspace</div>
            <div className="text-sm font-medium text-white mt-0.5">Acme Industries</div>
            <div className="text-[11px] text-sidebar-foreground/60 mt-1">Professional · 312 seats</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 h-16 border-b border-border bg-card/80 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Breadcrumbs pathname={pathname} />
          </div>
          <div className="flex items-center gap-3">
            <RoleBadge role={user.role} />
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-md hover:bg-muted px-2 py-1.5 transition-colors"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: `oklch(0.55 0.16 ${user.avatarColor})` }}
                >
                  {initials(user.name)}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-sm font-medium text-foreground">{user.name}</div>
                  <div className="text-[11px] text-muted-foreground">{user.department}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-popover shadow-lg overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-border">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate({ to: "/login" });
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, { label: string; cls: string }> = {
    ADMIN: { label: "Admin", cls: "bg-primary/10 text-primary ring-primary/20" },
    CONTENT_MANAGER: { label: "Content Manager", cls: "bg-info/10 text-info ring-info/20" },
    EMPLOYEE: { label: "Employee", cls: "bg-muted text-muted-foreground ring-border" },
  };
  const v = map[role];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${v.cls}`}>
      {v.label}
    </span>
  );
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    search: "Search",
    documents: "Documents",
    upload: "Upload",
    collections: "Collections",
    "search-history": "Search History",
    audit: "Audit Log",
    users: "Users",
    settings: "Settings",
  };
  const segs = pathname.split("/").filter(Boolean);
  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {segs.map((seg, i) => {
        const label = labels[seg] ?? decodeURIComponent(seg);
        const last = i === segs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-muted-foreground/50">/</span>}
            <span className={last ? "font-medium text-foreground" : "text-muted-foreground"}>{label}</span>
          </span>
        );
      })}
    </nav>
  );
}
