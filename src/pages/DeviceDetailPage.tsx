import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Server, Cpu, HardDrive, MapPin, Building2, Tag, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const deviceId = Number(id);
  const { data: device, isLoading } = trpc.device.getById.useQuery({ id: deviceId });
  const { data: interfaces } = trpc.device.getInterfaces.useQuery({ deviceId });
  const { data: changeLog } = trpc.changeLog.list.useQuery({ objectType: "devices", objectId: deviceId, pageSize: 10 });

  if (isLoading) return <div className="p-6 text-text-muted">Loading...</div>;
  if (!device) return <div className="p-6 text-text-muted">Device not found</div>;

  const d = device as any;

  const infoRows = [
    { label: "Site", value: d.site?.name, icon: MapPin },
    { label: "Rack", value: d.rack?.name, icon: HardDrive },
    { label: "Tenant", value: d.tenant?.name, icon: Building2 },
    { label: "Device Type", value: d.deviceType?.model, icon: Server },
    { label: "Role", value: d.role?.name, icon: Cpu },
    { label: "Platform", value: d.platform?.name, icon: Tag },
    { label: "Serial Number", value: d.serial },
    { label: "Asset Tag", value: d.assetTag },
    { label: "Airflow", value: d.airflow },
    { label: "Position", value: d.position ? `U${d.position}` : "Not in rack" },
  ];

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/devices" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Devices
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: "var(--font-heading)" }}>{d.name}</h1>
              <StatusBadge status={d.status} />
            </div>
            <p className="text-text-secondary text-sm">
              {d.deviceType?.model} | {d.role?.name} | {d.site?.name} {d.rack ? `> ${d.rack.name}` : ""}
            </p>
          </div>
          <Button variant="outline" className="border-border bg-surface-secondary hover:bg-surface-tertiary text-text-primary gap-2">
            <Pencil className="w-4 h-4" /> Edit
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="bg-surface-primary border border-border mb-4">
          <TabsTrigger value="details" className="data-[state=active]:bg-accent data-[state=active]:text-white">Details</TabsTrigger>
          <TabsTrigger value="interfaces" className="data-[state=active]:bg-accent data-[state=active]:text-white">Interfaces ({interfaces?.length || 0})</TabsTrigger>
          <TabsTrigger value="changelog" className="data-[state=active]:bg-accent data-[state=active]:text-white">Change Log</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-primary border border-border rounded-lg p-5">
              <h2 className="text-base font-semibold text-text-primary mb-4">Device Information</h2>
              <div className="space-y-3">
                {infoRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-text-muted flex items-center gap-2">
                      {row.icon && <row.icon className="w-4 h-4" />}
                      {row.label}
                    </span>
                    <span className="text-sm text-text-primary font-medium">{row.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-surface-primary border border-border rounded-lg p-5">
                <h2 className="text-base font-semibold text-text-primary mb-3">Description</h2>
                <p className="text-sm text-text-secondary">{d.description || "No description provided."}</p>
              </div>
              <div className="bg-surface-primary border border-border rounded-lg p-5">
                <h2 className="text-base font-semibold text-text-primary mb-3">Comments</h2>
                <p className="text-sm text-text-secondary">{d.comments || "No comments."}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="interfaces">
          <div className="bg-surface-primary border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">MAC Address</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">MTU</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Enabled</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {(!interfaces || interfaces.length === 0) ? (
                  <tr><td colSpan={6} className="text-center py-8 text-text-muted">No interfaces</td></tr>
                ) : (
                  interfaces.map((iface: any) => (
                    <tr key={iface.id} className="border-b border-border/50 hover:bg-surface-tertiary/30">
                      <td className="px-4 py-3 text-sm text-text-primary font-medium">{iface.name}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{iface.type}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary font-mono">{iface.macAddress || "—"}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{iface.mtu || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${iface.enabled ? "bg-[#10B981]/15 text-[#10B981]" : "bg-[#EF4444]/15 text-[#EF4444]"}`}>
                          {iface.enabled ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{iface.description || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="changelog">
          <div className="bg-surface-primary border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Time</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Action</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {(!changeLog?.items || changeLog.items.length === 0) ? (
                  <tr><td colSpan={4} className="text-center py-8 text-text-muted">No changes recorded</td></tr>
                ) : (
                  changeLog.items.map((change: any) => (
                    <tr key={change.id} className="border-b border-border/50 hover:bg-surface-tertiary/30">
                      <td className="px-4 py-3 text-sm text-text-muted">{new Date(change.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-accent">{change.userName}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                          change.action === "create" ? "bg-[#10B981]/15 text-[#10B981]" :
                          change.action === "update" ? "bg-[#F59E0B]/15 text-[#F59E0B]" :
                          "bg-[#EF4444]/15 text-[#EF4444]"
                        }`}>{change.action}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary font-mono">{change.objectRepr}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
