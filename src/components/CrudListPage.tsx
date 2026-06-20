import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, Search, Filter, RefreshCw, Trash2, Pencil, ChevronLeft, ChevronRight, ArrowUpDown, Settings2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  defaultVisible?: boolean;
}

interface CrudListPageProps {
  title: string;
  description?: string;
  addPath?: string;
  columns: Column[];
  data: any[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onRefresh: () => void;
  onDelete?: (id: number) => void;
  onUpdate?: (id: number, data: Record<string, any>) => void;
  statusOptions?: string[];
  onStatusFilter?: (status: string) => void;
  createForm?: {
    fields: { key: string; label: string; type: string; options?: { value: string; label: string }[]; required?: boolean }[];
    onSubmit: (data: Record<string, any>) => void;
  };
  detailPath?: (id: number) => string;
  moduleColor?: string;
  exportData?: () => void;
}

export function CrudListPage({
  title, description, columns, data, total, page, pageSize, onPageChange, onSearch, onRefresh, onDelete, onUpdate, statusOptions, onStatusFilter, createForm, detailPath, moduleColor = "#3B82F6", exportData
}: CrudListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<any | null>(null);
  const [showDelete, setShowDelete] = useState<number | null>(null);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Initialize visible columns based on defaultVisible property
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    return columns.filter(c => c.defaultVisible !== false).map(c => c.key);
  });

  useEffect(() => {
    setVisibleColumns(prev => {
      const keys = columns.map(c => c.key);
      const defaultKeys = columns.filter(c => c.defaultVisible !== false).map(c => c.key);
      const filtered = prev.filter(k => keys.includes(k));
      return filtered.length > 0 ? filtered : defaultKeys;
    });
  }, [columns.map(c => c.key).join(",")]);

  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const sortedData = sortCol ? [...data].sort((a, b) => {
    const aVal = a[sortCol] ?? "";
    const bVal = b[sortCol] ?? "";
    if (sortDir === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  }) : data;

  const activeColumns = columns.filter(col => visibleColumns.includes(col.key));

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {/* Corner rounded vertical pill */}
            <div className="w-1.5 h-7 rounded-full shadow-sm" style={{ backgroundColor: moduleColor }} />
            <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: "var(--font-heading)" }}>{title}</h1>
          </div>
          {description && <p className="text-text-secondary text-sm ml-4.5">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {exportData && (
            <Button variant="outline" onClick={exportData} className="border-border bg-surface-secondary hover:bg-surface-tertiary text-text-primary rounded-lg">
              Export
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => setShowColumnConfig(true)} className="border-border bg-surface-secondary hover:bg-surface-tertiary rounded-lg" title="Configure Columns">
            <Settings2 className="w-4 h-4" />
          </Button>
          {createForm && (
            <Button onClick={() => { setFormData({}); setShowCreate(true); }} className="bg-accent hover:bg-accent-hover text-white gap-2 rounded-lg">
              <Plus className="w-4 h-4" /> Add
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={onRefresh} className="border-border bg-surface-secondary hover:bg-surface-tertiary rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); onSearch(e.target.value); }}
            className="pl-9 bg-surface-secondary border-border text-text-primary placeholder:text-text-muted rounded-lg"
          />
        </div>
        {statusOptions && (
          <Select onValueChange={(v) => onStatusFilter?.(v)}>
            <SelectTrigger className="w-40 bg-surface-secondary border-border text-text-primary rounded-lg">
              <Filter className="w-4 h-4 mr-2" /> <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-surface-primary border-border rounded-lg">
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <span className="text-sm text-text-muted ml-auto">{total} total</span>
      </div>

      {/* Table */}
      <div className="bg-surface-primary border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3 ${col.sortable ? "cursor-pointer hover:text-text-primary" : ""}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
              ))}
              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length + 1} className="text-center py-12 text-text-muted">
                  No records found
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-surface-tertiary/50 transition-colors">
                  {activeColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm">
                      {col.render ? col.render(row[col.key], row) : (
                        col.key === "status" ? <StatusBadge status={row[col.key]} /> :
                        col.key === "name" && detailPath ? (
                          <Link to={detailPath(row.id)} className="text-accent hover:text-accent-light font-medium">
                            {row[col.key] || `ID: ${row.id}`}
                          </Link>
                        ) : row[col.key] ?? "—"
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onUpdate && createForm && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-text-muted hover:text-accent rounded-lg"
                          onClick={() => {
                            setShowEdit(row);
                            const prefilled: Record<string, any> = {};
                            createForm.fields.forEach(f => {
                              prefilled[f.key] = row[f.key];
                            });
                            setFormData(prefilled);
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {!onUpdate && detailPath && (
                        <Link to={detailPath(row.id)}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-accent rounded-lg">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      )}
                      {onDelete && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-status-danger rounded-lg" onClick={() => setShowDelete(row.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-sm text-text-muted">
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 border-border bg-surface-secondary rounded-lg" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-text-secondary px-3">{page} / {totalPages}</span>
              <Button variant="outline" size="icon" className="h-8 w-8 border-border bg-surface-secondary rounded-lg" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Column Config Dialog */}
      <Dialog open={showColumnConfig} onOpenChange={setShowColumnConfig}>
        <DialogContent className="bg-surface-primary border-border max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Configure Table Columns</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
            {columns.map((col) => {
              const isChecked = visibleColumns.includes(col.key);
              return (
                <label key={col.key} className="flex items-center gap-3 p-2 rounded-md hover:bg-surface-secondary cursor-pointer text-sm text-text-primary">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    className="rounded border-border text-accent focus:ring-accent bg-surface-primary"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setVisibleColumns([...visibleColumns, col.key]);
                      } else {
                        // Prevent hiding all columns
                        if (visibleColumns.length > 1) {
                          setVisibleColumns(visibleColumns.filter(k => k !== col.key));
                        }
                      }
                    }}
                  />
                  {col.label}
                </label>
              );
            })}
          </div>
          <DialogFooter>
            <Button className="bg-accent hover:bg-accent-hover text-white w-full rounded-lg" onClick={() => setShowColumnConfig(false)}>
              Apply Columns
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      {createForm && (
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="bg-surface-primary border-border max-w-lg max-h-[80vh] overflow-y-auto rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-text-primary">Add New {title.replace(/s$/, "")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {createForm.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-text-secondary text-sm">{field.label}{field.required && <span className="text-status-danger ml-1">*</span>}</Label>
                  {field.type === "select" ? (
                    <Select onValueChange={(v) => setFormData({ ...formData, [field.key]: v })}>
                      <SelectTrigger className="bg-surface-secondary border-border text-text-primary rounded-lg">
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent className="bg-surface-primary border-border rounded-lg">
                        {field.options?.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      className="w-full h-24 bg-surface-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    />
                  ) : field.type === "multiselect" ? (
                    <div className="space-y-1 bg-surface-secondary border border-border p-3 rounded-lg max-h-40 overflow-y-auto">
                      {field.options?.map((opt) => {
                        const currentValue = formData[field.key] || [];
                        const isChecked = currentValue.includes(opt.value);
                        return (
                          <label key={opt.value} className="flex items-center gap-2 text-sm text-text-primary cursor-pointer py-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              className="rounded border-border text-accent focus:ring-accent bg-surface-primary"
                              onChange={(e) => {
                                const newVal = e.target.checked
                                  ? [...currentValue, opt.value]
                                  : currentValue.filter((v: any) => v !== opt.value);
                                setFormData({ ...formData, [field.key]: newVal });
                              }}
                            />
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <Input
                      type={field.type}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="bg-surface-secondary border-border text-text-primary placeholder:text-text-muted rounded-lg"
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreate(false); setFormData({}); }} className="border-border bg-surface-secondary hover:bg-surface-tertiary text-text-primary rounded-lg">
                Cancel
              </Button>
              <Button
                onClick={() => { createForm.onSubmit(formData); setShowCreate(false); setFormData({}); }}
                className="bg-accent hover:bg-accent-hover text-white rounded-lg"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {showEdit && createForm && onUpdate && (
        <Dialog open={!!showEdit} onOpenChange={(open) => { if (!open) { setShowEdit(null); setFormData({}); } }}>
          <DialogContent className="bg-surface-primary border-border max-w-lg max-h-[80vh] overflow-y-auto rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-text-primary">Edit {title.replace(/s$/, "")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {createForm.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-text-secondary text-sm">{field.label}{field.required && <span className="text-status-danger ml-1">*</span>}</Label>
                  {field.type === "select" ? (
                    <Select defaultValue={formData[field.key]?.toString()} onValueChange={(v) => setFormData({ ...formData, [field.key]: v })}>
                      <SelectTrigger className="bg-surface-secondary border-border text-text-primary rounded-lg">
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent className="bg-surface-primary border-border rounded-lg">
                        {field.options?.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      className="w-full h-24 bg-surface-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    />
                  ) : field.type === "multiselect" ? (
                    <div className="space-y-1 bg-surface-secondary border border-border p-3 rounded-lg max-h-40 overflow-y-auto">
                      {field.options?.map((opt) => {
                        const currentValue = formData[field.key] || [];
                        const isChecked = currentValue.includes(opt.value);
                        return (
                          <label key={opt.value} className="flex items-center gap-2 text-sm text-text-primary cursor-pointer py-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              className="rounded border-border text-accent focus:ring-accent bg-surface-primary"
                              onChange={(e) => {
                                const newVal = e.target.checked
                                  ? [...currentValue, opt.value]
                                  : currentValue.filter((v: any) => v !== opt.value);
                                setFormData({ ...formData, [field.key]: newVal });
                              }}
                            />
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <Input
                      type={field.type}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      value={formData[field.key] || ""}
                      className="bg-surface-secondary border-border text-text-primary placeholder:text-text-muted rounded-lg"
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEdit(null); setFormData({}); }} className="border-border bg-surface-secondary hover:bg-surface-tertiary text-text-primary rounded-lg">
                Cancel
              </Button>
              <Button
                onClick={() => { onUpdate(showEdit.id, formData); setShowEdit(null); setFormData({}); }}
                className="bg-accent hover:bg-accent-hover text-white rounded-lg"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent className="bg-surface-primary border-border rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-text-secondary text-sm py-4">Are you sure you want to delete this record? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(null)} className="border-border bg-surface-secondary text-text-primary rounded-lg">Cancel</Button>
            <Button onClick={() => { if (showDelete) onDelete?.(showDelete); setShowDelete(null); }} className="bg-status-danger hover:bg-status-danger/80 text-white rounded-lg">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
