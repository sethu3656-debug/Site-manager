import { useState } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export function CustomEntityListPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const { data: moduleData } = trpc.customModule.list.useQuery({ pageSize: 100 });
  const customModule = moduleData?.items?.find((m: any) => m.slug === slug);
  const moduleId = customModule?.id;

  const { data, refetch } = trpc.customEntity.list.useQuery(
    moduleId ? { moduleId, page, pageSize: 25 } : undefined,
    { enabled: !!moduleId }
  );
  const create = trpc.customEntity.create.useMutation({ onSuccess: () => { refetch(); setShowCreate(false); setFormData({}); } });
  const del = trpc.customEntity.delete.useMutation({ onSuccess: () => { refetch(); setShowDelete(null); } });

  if (!customModule) return <div className="p-6 text-text-muted">Module not found</div>;

  const fields = (customModule as any).fields || [];
  const items = data?.items || [];

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link to="/custom-modules" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to Modules
          </Link>
          <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: "var(--font-heading)" }}>{customModule.pluralName}</h1>
          <p className="text-text-secondary text-sm">{customModule.description}</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-accent hover:bg-accent-hover text-white gap-2">
          <Plus className="w-4 h-4" /> Add {customModule.name}
        </Button>
      </div>

      <div className="bg-surface-primary border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Status</th>
              {fields.map((field: any) => (
                <th key={field.name} className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">{field.label}</th>
              ))}
              <th className="text-right text-xs font-semibold text-text-muted uppercase px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={fields.length + 2} className="text-center py-12 text-text-muted">No records</td></tr>
            ) : (
              items.map((item: any) => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-surface-tertiary/50">
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  {fields.map((field: any) => (
                    <td key={field.name} className="px-4 py-3 text-sm text-text-primary">
                      {item.data?.[field.name] || "—"}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-status-danger" onClick={() => setShowDelete(item.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-surface-primary border-border max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-text-primary">Add {customModule.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            {fields.map((field: any) => (
              <div key={field.name} className="space-y-1.5">
                <Label className="text-text-secondary text-sm">{field.label}{field.required && <span className="text-status-danger ml-1">*</span>}</Label>
                {field.type === "select" ? (
                  <Select onValueChange={(v) => setFormData({ ...formData, [field.name]: v })}>
                    <SelectTrigger className="bg-surface-secondary border-border text-text-primary"><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
                    <SelectContent className="bg-surface-primary border-border">
                      {(field.choices || []).map((opt: any) => (
                        <SelectItem key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "boolean" ? (
                  <Select onValueChange={(v) => setFormData({ ...formData, [field.name]: v === "true" })}>
                    <SelectTrigger className="bg-surface-secondary border-border text-text-primary"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-surface-primary border-border">
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input type={field.type === "integer" || field.type === "decimal" ? "number" : field.type === "date" || field.type === "datetime" ? "date" : "text"}
                    className="bg-surface-secondary border-border text-text-primary"
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setFormData({}); }} className="border-border bg-surface-secondary text-text-primary">Cancel</Button>
            <Button onClick={() => moduleId && create.mutate({ moduleId, data: formData })} className="bg-accent hover:bg-accent-hover text-white">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent className="bg-surface-primary border-border">
          <DialogHeader><DialogTitle className="text-text-primary">Confirm Delete</DialogTitle></DialogHeader>
          <p className="text-text-secondary text-sm py-4">Delete this record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(null)} className="border-border bg-surface-secondary text-text-primary">Cancel</Button>
            <Button onClick={() => { if (showDelete) del.mutate({ id: showDelete }); }} className="bg-status-danger hover:bg-status-danger/80 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
