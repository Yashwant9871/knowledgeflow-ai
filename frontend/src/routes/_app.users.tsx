import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import { UserPlus, MoreHorizontal } from "lucide-react";
import { PageHeader, Card, Button } from "@/components/ui-kit";
import { usersService } from "@/lib/services";
import { initials, timeAgo } from "@/lib/format";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/_app/users")({
  component: UsersPage,
  head: () => ({ meta: [{ title: "Users · KnowledgeFlow AI" }] }),
});

function UsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        description="Manage workspace members, their roles, and collection access."
        actions={<Button><UserPlus className="h-4 w-4" /> Invite user</Button>}
      />
      <div className="p-6">
        <Suspense fallback={<Card className="h-96 animate-pulse" />}>
          <UsersTable />
        </Suspense>
      </div>
    </>
  );
}

function UsersTable() {
  const { data: users } = useSuspenseQuery({ queryKey: ["users"], queryFn: () => usersService.list() });
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role | "">("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return users.filter((u) => {
      if (q && !`${u.name} ${u.email} ${u.department}`.toLowerCase().includes(q)) return false;
      if (role && u.role !== role) return false;
      return true;
    });
  }, [users, query, role]);

  return (
    <div className="space-y-4">
      <Card className="p-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, or department…"
          className="flex-1 min-w-[220px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role | "")}
          className="rounded-md border border-input bg-background px-3 h-9 text-sm"
        >
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="CONTENT_MANAGER">Content Manager</option>
          <option value="EMPLOYEE">Employee</option>
        </select>
        <div className="ml-auto text-xs text-muted-foreground">{filtered.length} of {users.length} users</div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-5 py-3">User</th>
                <th className="text-left font-medium px-3 py-3">Role</th>
                <th className="text-left font-medium px-3 py-3">Department</th>
                <th className="text-left font-medium px-3 py-3">Status</th>
                <th className="text-right font-medium px-3 py-3">Collection access</th>
                <th className="text-right font-medium px-3 py-3">Last active</th>
                <th className="text-right font-medium px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: `oklch(0.55 0.16 ${u.avatarColor})` }}>{initials(u.name)}</div>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-3 py-3 text-muted-foreground">{u.department}</td>
                  <td className="px-3 py-3"><StatusPill status={u.status} /></td>
                  <td className="px-3 py-3 text-right text-xs text-muted-foreground">{u.collectionAccess.length} collections</td>
                  <td className="px-3 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">{timeAgo(u.lastActive)}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="p-1 rounded hover:bg-muted text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, string> = {
    ADMIN: "bg-primary/10 text-primary ring-primary/20",
    CONTENT_MANAGER: "bg-info/10 text-info ring-info/20",
    EMPLOYEE: "bg-muted text-muted-foreground ring-border",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${map[role]}`}>{role.replace("_"," ")}</span>;
}

function StatusPill({ status }: { status: "ACTIVE" | "INVITED" | "SUSPENDED" }) {
  const map = {
    ACTIVE: "bg-success/15 text-success ring-success/30",
    INVITED: "bg-warning/15 text-warning ring-warning/30",
    SUSPENDED: "bg-destructive/15 text-destructive ring-destructive/30",
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${map[status]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status.toLowerCase()}</span>;
}
