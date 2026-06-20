import { useState } from "react";
import { trpc } from "@/providers/trpc";

export function ChangeLogPage() {
  const [page, setPage] = useState(1);
  const { data, refetch } = trpc.changeLog.list.useQuery({ page, pageSize: 25 });

  const items = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1" style={{ fontFamily: "var(--font-heading)" }}>Change Log</h1>
        <p className="text-text-secondary text-sm">Track all changes across the platform</p>
      </div>
      <div className="bg-surface-primary border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Time</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">User</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Action</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Object Type</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Object</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Changes</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-text-muted">No changes recorded</td></tr>
            ) : (
              items.map((change: any) => (
                <tr key={change.id} className="border-b border-border/50 hover:bg-surface-tertiary/30">
                  <td className="px-4 py-3 text-sm text-text-muted whitespace-nowrap">{new Date(change.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-accent/10 text-accent">{change.userName}</span></td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                      change.action === "create" ? "bg-[#10B981]/15 text-[#10B981]" :
                      change.action === "update" ? "bg-[#F59E0B]/15 text-[#F59E0B]" :
                      "bg-[#EF4444]/15 text-[#EF4444]"
                    }`}>{change.action}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{change.changedObjectType}</td>
                  <td className="px-4 py-3 text-sm text-text-primary font-mono">{change.objectRepr}</td>
                  <td className="px-4 py-3 text-sm text-text-muted max-w-xs truncate">
                    {change.postchangeData ? JSON.stringify(change.postchangeData).slice(0, 60) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
