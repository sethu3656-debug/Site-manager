import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, HardDrive, MapPin, Layers, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export function RackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const rackId = Number(id);
  const { data: rack, isLoading } = trpc.rack.getById.useQuery({ id: rackId });
  const [face, setFace] = useState<"front" | "rear">("front");

  if (isLoading) return <div className="p-6 text-text-muted">Loading Rack Details...</div>;
  if (!rack) return <div className="p-6 text-text-muted">Rack not found</div>;

  const r = rack as any;
  const uHeight = r.uHeight || 42;

  // Filter devices by face (front vs back)
  const faceDevices = r.devices?.filter((d: any) => !d.face || d.face === face) || [];

  // Create an array mapping U slots from 1 to uHeight
  const elevation: (any | null)[] = Array(uHeight + 1).fill(null);

  faceDevices.forEach((dev: any) => {
    const pos = Number(dev.position);
    const height = dev.deviceType?.uHeight || 1;
    if (pos > 0 && pos <= uHeight) {
      // Mark base position
      elevation[pos] = { type: "device", device: dev, height, isBase: true };
      // Mark occupied positions above the base
      for (let i = 1; i < height; i++) {
        if (pos + i <= uHeight) {
          elevation[pos + i] = { type: "occupied", device: dev, base: pos };
        }
      }
    }
  });

  const renderRackSlots = () => {
    const slots = [];
    // Render from top down (U height down to 1)
    for (let u = uHeight; u >= 1; u--) {
      const slot = elevation[u];
      if (slot && slot.type === "occupied") {
        // Skip rendering because it is spanned by the base slot
        continue;
      }

      if (slot && slot.type === "device") {
        const dev = slot.device;
        const roleColor = dev.role?.color || "#3B82F6";
        const heightRem = slot.height * 2.5; // 2.5rem per U

        slots.push(
          <div
            key={u}
            style={{ height: `${heightRem}rem` }}
            className="relative flex items-center border border-border border-b-0 hover:brightness-110 transition-all cursor-pointer"
          >
            {/* Role Color Indicator Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: roleColor }} />
            
            {/* Slot Number Label */}
            <div className="w-12 h-full flex items-center justify-center bg-surface-secondary border-r border-border text-xs text-text-muted font-mono shrink-0 select-none">
              U{u}
              {slot.height > 1 && ` - U${u + slot.height - 1}`}
            </div>

            {/* Device Info */}
            <Link
              to={`/devices/${dev.id}`}
              className="flex-1 h-full flex flex-col justify-center px-4 overflow-hidden"
              style={{ backgroundColor: `${roleColor}15` }}
            >
              <span className="text-sm font-semibold text-text-primary truncate">{dev.name || `Device ID: ${dev.id}`}</span>
              <span className="text-xs text-text-secondary truncate">{dev.deviceType?.model || "Generic Model"} ({dev.role?.name || "No Role"})</span>
            </Link>
          </div>
        );
      } else {
        // Empty slot
        slots.push(
          <div
            key={u}
            className="h-10 flex items-center border border-border border-b-0 hover:bg-surface-secondary/20 transition-colors"
          >
            {/* Slot Number Label */}
            <div className="w-12 h-full flex items-center justify-center bg-surface-secondary border-r border-border text-xs text-text-muted font-mono shrink-0 select-none">
              U{u}
            </div>
            {/* Empty space */}
            <div className="flex-1 h-full flex items-center px-4 text-xs text-text-muted italic select-none">
              Empty
            </div>
          </div>
        );
      }
    }
    return slots;
  };

  const infoRows = [
    { label: "Status", value: <StatusBadge status={r.status} /> },
    { label: "Site", value: r.site ? <Link to={`/sites/${r.site.id}`} className="text-accent hover:underline font-medium">{r.site.name}</Link> : "—" },
    { label: "U Height", value: `${r.uHeight || 42}U` },
    { label: "Width", value: `${r.width || 19} inches` },
    { label: "Type", value: r.type || "—" },
    { label: "Serial Number", value: r.serial || "—" },
    { label: "Asset Tag", value: r.assetTag || "—" },
  ];

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/racks" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Racks
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <HardDrive className="w-6 h-6 text-accent" />
              <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: "var(--font-heading)" }}>{r.name}</h1>
              <StatusBadge status={r.status} />
            </div>
            <p className="text-text-secondary text-sm ml-9">
              {r.site?.name ? `${r.site.name}` : "No Site"} | {r.uHeight || 42}U Rack
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Rack Metadata */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-primary border border-border rounded-lg p-5">
            <h2 className="text-base font-semibold text-text-primary mb-4">Rack Information</h2>
            <div className="space-y-3">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-text-muted">{row.label}</span>
                  <span className="text-sm text-text-primary font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface-primary border border-border rounded-lg p-5">
            <h2 className="text-base font-semibold text-text-primary mb-3">Description</h2>
            <p className="text-sm text-text-secondary">{r.description || "No description provided."}</p>
          </div>
        </div>

        {/* Right column: Rack Elevation visual */}
        <div className="lg:col-span-2 bg-surface-primary border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary">Rack Elevation</h2>
            <div className="flex border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setFace("front")}
                className={`px-3 py-1.5 text-xs font-semibold ${face === "front" ? "bg-accent text-white" : "bg-surface-secondary text-text-secondary hover:text-text-primary"}`}
              >
                Front View
              </button>
              <button
                onClick={() => setFace("rear")}
                className={`px-3 py-1.5 text-xs font-semibold ${face === "rear" ? "bg-accent text-white" : "bg-surface-secondary text-text-secondary hover:text-text-primary"}`}
              >
                Rear View
              </button>
            </div>
          </div>

          {/* Visual Server Cabinet Container */}
          <div className="max-w-md mx-auto bg-sidebar-bg border-4 border-border rounded-xl p-4 shadow-2xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-border rounded-full text-[10px] font-bold tracking-widest text-text-muted uppercase">
              Cabinet Elevation
            </div>

            {/* Slots Area */}
            <div className="border-b border-border flex flex-col rounded-md overflow-hidden bg-canvas">
              {renderRackSlots()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
