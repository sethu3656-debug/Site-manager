import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, MapPin, Download, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const siteId = Number(id);
  const utils = trpc.useUtils();
  
  // Queries
  const { data: site, isLoading, refetch } = trpc.site.getById.useQuery({ id: siteId });
  const { data: regions } = trpc.region.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: siteGroups } = trpc.siteGroup.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: tenants } = trpc.tenant.list.useQuery({ page: 1, pageSize: 1000 });

  // Mutations
  const createSiteMutation = trpc.site.create.useMutation({
    onSuccess: () => {
      utils.site.list.invalidate();
    }
  });

  const updateSiteMutation = trpc.site.update.useMutation({
    onSuccess: () => {
      refetch();
      utils.site.getById.invalidate({ id: siteId });
      utils.site.list.invalidate();
    }
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState<Record<string, any>>({});
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});

  // Prefill edit form when dialog opens
  useEffect(() => {
    if (site) {
      const s = site as any;
      setEditFormData({
        name: s.name || "",
        slug: s.slug || "",
        status: s.status || "active",
        regionId: s.regionId ? s.regionId.toString() : "",
        siteGroupId: s.siteGroupId ? s.siteGroupId.toString() : "",
        tenantId: s.tenantId ? s.tenantId.toString() : "",
        timeZone: s.timeZone || "",
        physicalAddress: s.physicalAddress || "",
        shippingAddress: s.shippingAddress || "",
        latitude: s.latitude || "",
        longitude: s.longitude || "",
        description: s.description || "",
        comments: s.comments || "",
      });
    }
  }, [site, showEditDialog]);

  if (isLoading) return <div className="p-6 text-text-muted">Loading Site Details...</div>;
  if (!site) return <div className="p-6 text-text-muted">Site not found</div>;

  const s = site as any;

  // Export site to JSON file
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(s, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `site_${s.slug || s.id}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCreateSite = () => {
    createSiteMutation.mutate(createFormData, {
      onSuccess: () => {
        setShowCreateDialog(false);
        setCreateFormData({});
      }
    });
  };

  const handleUpdateSite = () => {
    const parsedData = {
      ...editFormData,
      regionId: editFormData.regionId ? Number(editFormData.regionId) : null,
      siteGroupId: editFormData.siteGroupId ? Number(editFormData.siteGroupId) : null,
      tenantId: editFormData.tenantId ? Number(editFormData.tenantId) : null,
      latitude: editFormData.latitude ? String(editFormData.latitude) : null,
      longitude: editFormData.longitude ? String(editFormData.longitude) : null,
      timeZone: editFormData.timeZone || null,
      physicalAddress: editFormData.physicalAddress || null,
      shippingAddress: editFormData.shippingAddress || null,
      description: editFormData.description || null,
      comments: editFormData.comments || null,
    };

    updateSiteMutation.mutate({
      id: siteId,
      data: parsedData,
    }, {
      onSuccess: () => {
        setShowEditDialog(false);
      }
    });
  };

  const infoRows = [
    { label: "Status", value: <StatusBadge status={s.status} /> },
    { label: "Region", value: s.region?.name || "—" },
    { label: "Site Group", value: s.siteGroup?.name || "—" },
    { label: "Tenant", value: s.tenant?.name || "—" },
    { label: "Physical Address", value: s.physicalAddress || "—" },
    { label: "Shipping Address", value: s.shippingAddress || "—" },
    { label: "GPS Coordinates", value: s.latitude && s.longitude ? `${s.latitude}, ${s.longitude}` : "—" },
    { label: "Time Zone", value: s.timeZone || "—" },
  ];

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/sites" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Sites
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <MapPin className="w-6 h-6 text-accent" />
              <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: "var(--font-heading)" }}>{s.name}</h1>
              <StatusBadge status={s.status} />
            </div>
            <p className="text-text-secondary text-sm ml-9">
              {s.region?.name ? `${s.region.name} Region` : "No Region"} | {s.physicalAddress || "No address"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleExport} variant="outline" className="border-border bg-surface-secondary hover:bg-surface-tertiary text-text-primary gap-2 rounded-lg">
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button onClick={() => setShowEditDialog(true)} variant="outline" className="border-border bg-surface-secondary hover:bg-surface-tertiary text-text-primary gap-2 rounded-lg">
              <Pencil className="w-4 h-4" /> Edit Site
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-accent hover:bg-accent-hover text-white gap-2 rounded-lg">
              <Plus className="w-4 h-4" /> Create Site
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="bg-surface-primary border border-border mb-4 rounded-lg">
          <TabsTrigger value="details" className="data-[state=active]:bg-accent data-[state=active]:text-white rounded-md">Details</TabsTrigger>
          <TabsTrigger value="racks" className="data-[state=active]:bg-accent data-[state=active]:text-white rounded-md">Racks ({s.racks?.length || 0})</TabsTrigger>
          <TabsTrigger value="devices" className="data-[state=active]:bg-accent data-[state=active]:text-white rounded-md">Devices ({s.devices?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-primary border border-border rounded-xl p-5 shadow-sm">
              <h2 className="text-base font-semibold text-text-primary mb-4">Site Information</h2>
              <div className="space-y-3">
                {infoRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-text-muted">{row.label}</span>
                    <span className="text-sm text-text-primary font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-surface-primary border border-border rounded-xl p-5 shadow-sm">
                <h2 className="text-base font-semibold text-text-primary mb-3">Description</h2>
                <p className="text-sm text-text-secondary">{s.description || "No description provided."}</p>
              </div>
              <div className="bg-surface-primary border border-border rounded-xl p-5 shadow-sm">
                <h2 className="text-base font-semibold text-text-primary mb-3">Comments</h2>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{s.comments || "No comments."}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="racks">
          <div className="bg-surface-primary border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">U Height</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Width</th>
                </tr>
              </thead>
              <tbody>
                {(!s.racks || s.racks.length === 0) ? (
                  <tr><td colSpan={4} className="text-center py-8 text-text-muted">No racks at this site</td></tr>
                ) : (
                  s.racks.map((rack: any) => (
                    <tr key={rack.id} className="border-b border-border/50 hover:bg-surface-tertiary/30">
                      <td className="px-4 py-3 text-sm font-medium">
                        <Link to={`/racks/${rack.id}`} className="text-accent hover:underline">
                          {rack.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm"><StatusBadge status={rack.status} /></td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{rack.uHeight}U</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{rack.width} inches</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="devices">
          <div className="bg-surface-primary border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Serial</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Asset Tag</th>
                </tr>
              </thead>
              <tbody>
                {(!s.devices || s.devices.length === 0) ? (
                  <tr><td colSpan={4} className="text-center py-8 text-text-muted">No devices at this site</td></tr>
                ) : (
                  s.devices.map((dev: any) => (
                    <tr key={dev.id} className="border-b border-border/50 hover:bg-surface-tertiary/30">
                      <td className="px-4 py-3 text-sm font-medium">
                        <Link to={`/devices/${dev.id}`} className="text-accent hover:underline">
                          {dev.name || `ID: ${dev.id}`}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm"><StatusBadge status={dev.status} /></td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{dev.serial || "—"}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{dev.assetTag || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Site Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-surface-primary border-border max-w-lg max-h-[85vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Edit Site: {s.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Site Name*</Label>
              <Input
                value={editFormData.name || ""}
                className="bg-surface-secondary border-border text-text-primary rounded-lg"
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Slug*</Label>
              <Input
                value={editFormData.slug || ""}
                className="bg-surface-secondary border-border text-text-primary rounded-lg"
                onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Status</Label>
              <Select value={editFormData.status} onValueChange={(v) => setEditFormData({ ...editFormData, status: v })}>
                <SelectTrigger className="bg-surface-secondary border-border text-text-primary rounded-lg">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-surface-primary border-border rounded-lg">
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="decommissioning">Decommissioning</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Region</Label>
              <Select value={editFormData.regionId} onValueChange={(v) => setEditFormData({ ...editFormData, regionId: v })}>
                <SelectTrigger className="bg-surface-secondary border-border text-text-primary rounded-lg">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent className="bg-surface-primary border-border rounded-lg">
                  <SelectItem value="">None</SelectItem>
                  {regions?.items?.map((r: any) => (
                    <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Site Group</Label>
              <Select value={editFormData.siteGroupId} onValueChange={(v) => setEditFormData({ ...editFormData, siteGroupId: v })}>
                <SelectTrigger className="bg-surface-secondary border-border text-text-primary rounded-lg">
                  <SelectValue placeholder="Select Group" />
                </SelectTrigger>
                <SelectContent className="bg-surface-primary border-border rounded-lg">
                  <SelectItem value="">None</SelectItem>
                  {siteGroups?.items?.map((g: any) => (
                    <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Tenant</Label>
              <Select value={editFormData.tenantId} onValueChange={(v) => setEditFormData({ ...editFormData, tenantId: v })}>
                <SelectTrigger className="bg-surface-secondary border-border text-text-primary rounded-lg">
                  <SelectValue placeholder="Select Tenant" />
                </SelectTrigger>
                <SelectContent className="bg-surface-primary border-border rounded-lg">
                  <SelectItem value="">None</SelectItem>
                  {tenants?.items?.map((t: any) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Time Zone</Label>
              <Input
                value={editFormData.timeZone || ""}
                placeholder="e.g. Asia/Kolkata"
                className="bg-surface-secondary border-border text-text-primary rounded-lg"
                onChange={(e) => setEditFormData({ ...editFormData, timeZone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Physical Address</Label>
              <textarea
                value={editFormData.physicalAddress || ""}
                className="w-full h-20 bg-surface-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
                onChange={(e) => setEditFormData({ ...editFormData, physicalAddress: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Shipping Address</Label>
              <textarea
                value={editFormData.shippingAddress || ""}
                className="w-full h-20 bg-surface-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
                onChange={(e) => setEditFormData({ ...editFormData, shippingAddress: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-text-secondary text-sm">Latitude</Label>
                <Input
                  value={editFormData.latitude || ""}
                  className="bg-surface-secondary border-border text-text-primary rounded-lg"
                  onChange={(e) => setEditFormData({ ...editFormData, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-text-secondary text-sm">Longitude</Label>
                <Input
                  value={editFormData.longitude || ""}
                  className="bg-surface-secondary border-border text-text-primary rounded-lg"
                  onChange={(e) => setEditFormData({ ...editFormData, longitude: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Description</Label>
              <textarea
                value={editFormData.description || ""}
                className="w-full h-20 bg-surface-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Comments</Label>
              <textarea
                value={editFormData.comments || ""}
                className="w-full h-24 bg-surface-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
                onChange={(e) => setEditFormData({ ...editFormData, comments: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-border bg-surface-secondary text-text-primary rounded-lg">
              Cancel
            </Button>
            <Button onClick={handleUpdateSite} className="bg-accent hover:bg-accent-hover text-white rounded-lg">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-surface-primary border-border max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Create New Site</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Site Name*</Label>
              <Input
                placeholder="Enter site name"
                className="bg-surface-secondary border-border text-text-primary rounded-lg"
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Slug*</Label>
              <Input
                placeholder="Enter slug (e.g. site-a)"
                className="bg-surface-secondary border-border text-text-primary rounded-lg"
                onChange={(e) => setCreateFormData({ ...createFormData, slug: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Status</Label>
              <Select onValueChange={(v) => setCreateFormData({ ...createFormData, status: v })}>
                <SelectTrigger className="bg-surface-secondary border-border text-text-primary rounded-lg">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-surface-primary border-border rounded-lg">
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm">Physical Address</Label>
              <Input
                placeholder="Enter address"
                className="bg-surface-secondary border-border text-text-primary rounded-lg"
                onChange={(e) => setCreateFormData({ ...createFormData, physicalAddress: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); setCreateFormData({}); }} className="border-border bg-surface-secondary text-text-primary rounded-lg">
              Cancel
            </Button>
            <Button onClick={handleCreateSite} className="bg-accent hover:bg-accent-hover text-white rounded-lg">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
