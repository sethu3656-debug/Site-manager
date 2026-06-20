import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Globe, MapPin, HardDrive, Server, ChevronRight, ChevronDown, Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExplorerPage() {
  const { data: regions, isLoading: rLoading } = trpc.region.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: sites, isLoading: sLoading } = trpc.site.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: racks, isLoading: kLoading } = trpc.rack.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: devices, isLoading: dLoading } = trpc.device.list.useQuery({ page: 1, pageSize: 1000 });

  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<{ type: string; id: number; data: any } | null>(null);

  const isLoading = rLoading || sLoading || kLoading || dLoading;

  if (isLoading) return <div className="p-6 text-text-muted">Loading Explorer...</div>;

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev =>
      prev.includes(nodeId) ? prev.filter(n => n !== nodeId) : [...prev, nodeId]
    );
  };

  const isExpanded = (nodeId: string) => expandedNodes.includes(nodeId);

  // Grouping objects
  const rList = regions?.items || [];
  const sList = sites?.items || [];
  const kList = racks?.items || [];
  const dList = devices?.items || [];

  return (
    <div className="p-6 max-w-[1440px] mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <Globe className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: "var(--font-heading)" }}>NetBox Explorer</h1>
        </div>
        <p className="text-text-secondary text-sm ml-9">Browse your infrastructure hierarchy dynamically in a unified tree explorer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: Explorer Tree */}
        <div className="lg:col-span-1 bg-surface-primary border border-border rounded-lg p-4 overflow-y-auto flex flex-col">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Infrastructure Tree</h2>
          <div className="space-y-1">
            {rList.map((region: any) => {
              const rNodeId = `region-${region.id}`;
              const rSites = sList.filter((s: any) => s.regionId === region.id);
              const hasSites = rSites.length > 0;
              const expanded = isExpanded(rNodeId);

              return (
                <div key={region.id} className="space-y-1">
                  <div
                    onClick={() => {
                      setSelectedNode({ type: "region", id: region.id, data: region });
                      if (hasSites) toggleNode(rNodeId);
                    }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-surface-secondary/40 transition-colors select-none ${selectedNode?.type === "region" && selectedNode?.id === region.id ? "bg-accent/10 border-l-2 border-accent text-accent" : "text-text-primary"}`}
                  >
                    {hasSites ? (expanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />) : <span className="w-4" />}
                    <Globe className="w-4 h-4 text-accent/80 shrink-0" />
                    <span className="font-semibold truncate">{region.name}</span>
                    <span className="text-xs text-text-muted font-mono ml-auto">({rSites.length})</span>
                  </div>

                  {/* Sites layer */}
                  {expanded && hasSites && (
                    <div className="pl-6 space-y-1 border-l border-border/40 ml-4">
                      {rSites.map((site: any) => {
                        const sNodeId = `site-${site.id}`;
                        const sRacks = kList.filter((r: any) => r.siteId === site.id);
                        const sExpanded = isExpanded(sNodeId);
                        const hasRacks = sRacks.length > 0;

                        return (
                          <div key={site.id} className="space-y-1">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNode({ type: "site", id: site.id, data: site });
                                if (hasRacks) toggleNode(sNodeId);
                              }}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer hover:bg-surface-secondary/40 transition-colors select-none ${selectedNode?.type === "site" && selectedNode?.id === site.id ? "bg-accent/10 border-l-2 border-accent text-accent" : "text-text-secondary"}`}
                            >
                              {hasRacks ? (sExpanded ? <ChevronDown className="w-3.5 h-3.5 text-text-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-text-muted" />) : <span className="w-3.5" />}
                              <MapPin className="w-3.5 h-3.5 text-status-active shrink-0" />
                              <span className="font-medium truncate">{site.name}</span>
                              <span className="text-xs text-text-muted font-mono ml-auto">({sRacks.length})</span>
                            </div>

                            {/* Racks layer */}
                            {sExpanded && hasRacks && (
                              <div className="pl-6 space-y-1 border-l border-border/40 ml-4">
                                {sRacks.map((rack: any) => {
                                  const kNodeId = `rack-${rack.id}`;
                                  const kDevices = dList.filter((d: any) => d.rackId === rack.id);
                                  const kExpanded = isExpanded(kNodeId);
                                  const hasDevices = kDevices.length > 0;

                                  return (
                                    <div key={rack.id} className="space-y-1">
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedNode({ type: "rack", id: rack.id, data: rack });
                                          if (hasDevices) toggleNode(kNodeId);
                                        }}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer hover:bg-surface-secondary/40 transition-colors select-none ${selectedNode?.type === "rack" && selectedNode?.id === rack.id ? "bg-accent/10 border-l-2 border-accent text-accent" : "text-text-secondary"}`}
                                      >
                                        {hasDevices ? (kExpanded ? <ChevronDown className="w-3.5 h-3.5 text-text-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-text-muted" />) : <span className="w-3.5" />}
                                        <HardDrive className="w-3.5 h-3.5 text-status-warning shrink-0" />
                                        <span className="truncate">{rack.name}</span>
                                        <span className="text-xs text-text-muted font-mono ml-auto">({kDevices.length})</span>
                                      </div>

                                      {/* Devices layer */}
                                      {kExpanded && hasDevices && (
                                        <div className="pl-6 space-y-1 border-l border-border/40 ml-4">
                                          {kDevices.map((dev: any) => (
                                            <div
                                              key={dev.id}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedNode({ type: "device", id: dev.id, data: dev });
                                              }}
                                              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] cursor-pointer hover:bg-surface-secondary/40 transition-colors select-none ${selectedNode?.type === "device" && selectedNode?.id === dev.id ? "bg-accent/10 border-l-2 border-accent text-accent" : "text-text-muted"}`}
                                            >
                                              <span className="w-3.5" />
                                              <Server className="w-3.5 h-3.5 text-accent/70 shrink-0" />
                                              <span className="truncate">{dev.name || `ID: ${dev.id}`}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Properties panel */}
        <div className="lg:col-span-2 bg-surface-primary border border-border rounded-lg p-6 overflow-y-auto flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-6">
              {/* Node Title Header */}
              <div className="border-b border-border pb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest mb-1">
                  <Info className="w-3.5 h-3.5" /> {selectedNode.type} Details
                </div>
                <h3 className="text-xl font-bold text-text-primary">{selectedNode.data.name || `ID: ${selectedNode.data.id}`}</h3>
              </div>

              {/* Attributes list */}
              <div className="bg-surface-secondary/40 border border-border p-4 rounded-lg space-y-3">
                {selectedNode.type === "region" && (
                  <>
                    <div className="flex justify-between text-sm py-1 border-b border-border/40"><span className="text-text-muted">Slug</span><span className="text-text-primary font-mono">{selectedNode.data.slug}</span></div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/40"><span className="text-text-muted">Description</span><span className="text-text-primary">{selectedNode.data.description || "—"}</span></div>
                  </>
                )}
                {selectedNode.type === "site" && (
                  <>
                    <div className="flex justify-between text-sm py-1 border-b border-border/40"><span className="text-text-muted">Slug</span><span className="text-text-primary font-mono">{selectedNode.data.slug}</span></div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/40"><span className="text-text-muted">Status</span><span className="text-text-primary capitalize">{selectedNode.data.status}</span></div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/40"><span className="text-text-muted">Address</span><span className="text-text-primary">{selectedNode.data.physicalAddress || "—"}</span></div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/40"><span className="text-text-muted">Description</span><span className="text-text-primary">{selectedNode.data.description || "—"}</span></div>
                  </>
                )}
                {selectedNode.type === "rack" && (
                  <>
                    <div className="flex justify-between text-sm py-1 border-b border-border/40"><span className="text-text-muted">Status</span><span className="text-text-primary capitalize">{selectedNode.data.status}</span></div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/40"><span className="text-text-muted">U Height</span><span className="text-text-primary">{selectedNode.data.uHeight}U</span></div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/40"><span className="text-text-muted">Cabinet Width</span><span className="text-text-primary">{selectedNode.data.width} inches</span></div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/40"><span className="text-text-muted">Type</span><span className="text-text-primary">{selectedNode.data.type || "—"}</span></div>
                  </>
                )}
                {selectedNode.type === "device" && (
                  <>
                    <div className="flex justify-between text-sm py-1 border-b border-border/40"><span className="text-text-muted">Status</span><span className="text-text-primary capitalize">{selectedNode.data.status}</span></div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/40"><span className="text-text-muted">Serial Number</span><span className="text-text-primary font-mono">{selectedNode.data.serial || "—"}</span></div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/40"><span className="text-text-muted">Asset Tag</span><span className="text-text-primary font-mono">{selectedNode.data.assetTag || "—"}</span></div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/40"><span className="text-text-muted">U Position</span><span className="text-text-primary">{selectedNode.data.position ? `U${selectedNode.data.position}` : "Not in rack"}</span></div>
                  </>
                )}
              </div>

              {/* Action Button */}
              {selectedNode.type !== "region" && (
                <Link to={selectedNode.type === "device" ? `/devices/${selectedNode.id}` : selectedNode.type === "site" ? `/sites/${selectedNode.id}` : `/racks/${selectedNode.id}`}>
                  <Button className="bg-accent hover:bg-accent-hover text-white gap-2 w-full">
                    <ExternalLink className="w-4 h-4" /> Go to Full details page
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 text-text-muted flex-1">
              <Globe className="w-12 h-12 mb-3 opacity-30 text-accent" />
              <p className="text-sm font-medium">Select a node from the tree on the left to inspect its parameters and related settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
