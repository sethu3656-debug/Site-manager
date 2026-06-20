import { useState, useEffect, useRef, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { Search, ZoomIn, ZoomOut, RefreshCw, X, Info, Layers, Cable, Server, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";

interface Position {
  x: number;
  y: number;
}

export function TopologyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedLink, setSelectedLink] = useState<any | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<number, Position>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState(true);

  const svgRef = useRef<SVGSVGElement>(null);

  // Queries
  const { data: devicesData, isLoading: loadingDevices } = trpc.device.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: cablesData, isLoading: loadingCables } = trpc.cable.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: interfacesData, isLoading: loadingInterfaces } = trpc.interface.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: deviceRolesData } = trpc.deviceRole.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: deviceTypesData } = trpc.deviceType.list.useQuery({ page: 1, pageSize: 1000 });

  const devices = devicesData?.items || [];
  const cables = cablesData?.items || [];
  const interfaces = interfacesData?.items || [];
  const deviceRoles = deviceRolesData?.items || [];
  const deviceTypes = deviceTypesData?.items || [];

  const rolesMap = useMemo(() => {
    return new Map<number, any>(deviceRoles.map((r: any) => [r.id, r]));
  }, [deviceRoles]);

  const typesMap = useMemo(() => {
    return new Map<number, any>(deviceTypes.map((t: any) => [t.id, t]));
  }, [deviceTypes]);

  // Map interface ID to interface and device
  const interfaceMap = useMemo(() => {
    const map = new Map<number, { interface: any; device: any }>();
    interfaces.forEach((iface: any) => {
      const dev = devices.find((d: any) => d.id === iface.deviceId);
      map.set(iface.id, { interface: iface, device: dev });
    });
    return map;
  }, [interfaces, devices]);

  // Construct links from cables
  const links = useMemo(() => {
    return cables.map((cable: any) => {
      const aSide = interfaceMap.get(Number(cable.aSideObjectId));
      const bSide = interfaceMap.get(Number(cable.bSideObjectId));

      if (aSide?.device && bSide?.device) {
        return {
          id: cable.id,
          source: aSide.device.id,
          target: bSide.device.id,
          sourceInterface: aSide.interface,
          targetInterface: bSide.interface,
          cable,
        };
      }
      return null;
    }).filter(Boolean) as any[];
  }, [cables, interfaceMap]);

  // Initialize positions on a circle layout
  const resetLayout = () => {
    if (devices.length === 0) return;
    const positions: Record<number, Position> = {};
    const centerX = 400;
    const centerY = 300;
    const radius = Math.min(centerX, centerY) * 0.7 + (devices.length > 5 ? devices.length * 10 : 0);

    devices.forEach((dev: any, index: number) => {
      const angle = (index / devices.length) * 2 * Math.PI;
      positions[dev.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
    setNodePositions(positions);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (devices.length > 0 && Object.keys(nodePositions).length === 0) {
      resetLayout();
    }
  }, [devices, nodePositions]);

  // Filter devices based on search query
  const filteredDevices = useMemo(() => {
    if (!searchQuery) return devices;
    return devices.filter((d: any) =>
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.serial?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [devices, searchQuery]);

  // Mouse handlers for dragging nodes
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: number) => {
    e.stopPropagation();
    setSelectedNode(devices.find((d: any) => d.id === nodeId));
    setSelectedLink(null);
    setDraggingNodeId(nodeId);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId !== null && nodePositions[draggingNodeId]) {
      // Calculate adjusted coords based on zoom and pan
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setNodePositions((prev) => ({
        ...prev,
        [draggingNodeId]: { x, y },
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  // Zoom handlers
  const handleZoom = (factor: number) => {
    setZoom((prev) => Math.max(0.1, Math.min(4, prev * factor)));
  };

  const isLoading = loadingDevices || loadingCables || loadingInterfaces;

  // Selected details computed
  const selectedNodeDetails = useMemo(() => {
    if (!selectedNode) return null;
    const role = rolesMap.get(selectedNode.roleId);
    const type = typesMap.get(selectedNode.deviceTypeId);
    const deviceIfaces = interfaces.filter((i: any) => i.deviceId === selectedNode.id);
    const deviceLinks = links.filter((l) => l.source === selectedNode.id || l.target === selectedNode.id);

    return {
      device: selectedNode,
      role,
      type,
      interfaces: deviceIfaces,
      connections: deviceLinks,
    };
  }, [selectedNode, rolesMap, typesMap, interfaces, links]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
      {/* Topology Canvas Area */}
      <div className="flex-1 flex flex-col relative bg-canvas overflow-hidden border-r border-border">
        {/* Top Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto bg-surface-primary/90 backdrop-blur border border-border p-1.5 rounded-lg shadow-sm">
            <Search className="w-4 h-4 text-text-muted ml-2" />
            <Input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 h-8 bg-transparent border-0 ring-0 focus-visible:ring-0 text-sm placeholder:text-text-muted"
            />
            {searchQuery && (
              <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => setSearchQuery("")}>
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto bg-surface-primary/90 backdrop-blur border border-border p-1.5 rounded-lg shadow-sm">
            <Button size="icon" variant="ghost" className="w-8 h-8 text-text-secondary" onClick={() => handleZoom(1.2)} title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="w-8 h-8 text-text-secondary" onClick={() => handleZoom(0.8)} title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="w-8 h-8 text-text-secondary" onClick={resetLayout} title="Recenter & Reset Layout">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button
              variant={showLabels ? "secondary" : "ghost"}
              className="h-8 px-2.5 text-xs text-text-secondary"
              onClick={() => setShowLabels(!showLabels)}
            >
              Labels: {showLabels ? "On" : "Off"}
            </Button>
          </div>
        </div>

        {/* SVG Container */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-text-secondary font-medium">Building Network Map...</span>
            </div>
          </div>
        ) : devices.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
            <Server className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">No devices found. Create devices and cables to view topology.</p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="flex-1 w-full h-full cursor-grab active:cursor-grabbing outline-none select-none"
            onMouseDown={handleCanvasMouseDown}
          >
            {/* Grid Pattern */}
            <defs>
              <pattern id="topo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border/20" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topo-grid)" />

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Cable Links (Lines) */}
              {links.map((link) => {
                const sourcePos = nodePositions[link.source];
                const targetPos = nodePositions[link.target];
                if (!sourcePos || !targetPos) return null;

                const isSelected = selectedLink?.id === link.id;
                const strokeColor = link.cable.color || "#3B82F6";

                return (
                  <g key={link.id} className="cursor-pointer">
                    <line
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 5 : 2}
                      className="transition-all hover:stroke-[5px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLink(link);
                        setSelectedNode(null);
                      }}
                    />
                    {/* Hover hotspot */}
                    <line
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke="transparent"
                      strokeWidth={15}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLink(link);
                        setSelectedNode(null);
                      }}
                    />
                  </g>
                );
              })}

              {/* Device Nodes (Circles/Cards) */}
              {filteredDevices.map((dev: any) => {
                const pos = nodePositions[dev.id];
                if (!pos) return null;

                const isSelected = selectedNode?.id === dev.id;
                const role = rolesMap.get(dev.roleId);
                const roleColor = role?.color || "#3B82F6";

                return (
                  <g
                    key={dev.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer"
                    onMouseDown={(e) => handleNodeMouseDown(e, dev.id)}
                  >
                    {/* Ring for selection */}
                    {isSelected && (
                      <circle r={26} fill="none" stroke="#3B82F6" strokeWidth={3} className="animate-pulse" />
                    )}

                    {/* Outer circle */}
                    <circle
                      r={20}
                      fill="var(--surface-primary)"
                      stroke={roleColor}
                      strokeWidth={3}
                      className="shadow-sm"
                    />

                    {/* Device Icon placeholder (first letter or Server Icon symbol) */}
                    <text
                      textAnchor="middle"
                      dy=".3em"
                      fill="currentColor"
                      className="text-text-primary text-[10px] font-bold select-none pointer-events-none"
                    >
                      {dev.name ? dev.name.substring(0, 2).toUpperCase() : `D${dev.id}`}
                    </text>

                    {/* Labels */}
                    {showLabels && (
                      <g transform="translate(0, 32)">
                        {/* Text background for legibility */}
                        <rect
                          x={-50}
                          y={-10}
                          width={100}
                          height={18}
                          rx={4}
                          fill="var(--surface-primary)"
                          className="opacity-90 stroke-border stroke-[0.5]"
                        />
                        <text
                          textAnchor="middle"
                          fill="currentColor"
                          className="text-[10px] font-medium text-text-primary select-none pointer-events-none truncate"
                        >
                          {dev.name || `Device ${dev.id}`}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>

      {/* Sidebar Details Panel */}
      <div className="w-80 bg-surface-primary flex flex-col border-l border-border h-full overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-accent" />
            <h2 className="font-semibold text-text-primary">Topology Explorer</h2>
          </div>
          {(selectedNode || selectedLink) && (
            <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => { setSelectedNode(null); setSelectedLink(null); }}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 p-4">
          {selectedNodeDetails ? (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-2.5 h-6 rounded-sm"
                    style={{ backgroundColor: selectedNodeDetails.role?.color || "#3B82F6" }}
                  />
                  <h3 className="font-bold text-lg text-text-primary truncate">{selectedNodeDetails.device.name || `Device ID: ${selectedNodeDetails.device.id}`}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedNodeDetails.device.status} />
                  <span className="text-xs text-text-muted font-medium">{selectedNodeDetails.role?.name || "No Role"}</span>
                </div>
              </div>

              <Card className="bg-surface-secondary border-border shadow-none">
                <CardContent className="p-3.5 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Type/Model:</span>
                    <span className="font-semibold text-text-primary">{selectedNodeDetails.type?.model || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Serial:</span>
                    <span className="font-semibold text-text-primary">{selectedNodeDetails.device.serial || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Asset Tag:</span>
                    <span className="font-semibold text-text-primary">{selectedNodeDetails.device.assetTag || "—"}</span>
                  </div>
                  {selectedNodeDetails.device.position && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Rack Position:</span>
                      <span className="font-semibold text-text-primary">RU {selectedNodeDetails.device.position} ({selectedNodeDetails.device.face})</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Interface connections list */}
              <div>
                <h4 className="font-semibold text-sm text-text-secondary mb-2 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Interfaces & Connections
                </h4>
                {selectedNodeDetails.interfaces.length === 0 ? (
                  <p className="text-xs text-text-muted">No interfaces configured for this device.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedNodeDetails.interfaces.map((iface: any) => {
                      // Find if this interface is connected by a cable
                      const connLink = selectedNodeDetails.connections.find(
                        (l: any) => l.sourceInterface.id === iface.id || l.targetInterface.id === iface.id
                      );
                      const isSource = connLink?.sourceInterface.id === iface.id;
                      const remoteDevName = connLink
                        ? (isSource
                            ? devices.find((d: any) => d.id === connLink.target)?.name
                            : devices.find((d: any) => d.id === connLink.source)?.name)
                        : null;
                      const remoteIfaceName = connLink
                        ? (isSource ? connLink.targetInterface.name : connLink.sourceInterface.name)
                        : null;

                      return (
                        <div key={iface.id} className="p-2 rounded bg-surface-secondary border border-border/60 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-text-primary">{iface.name}</span>
                            <span className="text-[10px] text-text-muted uppercase">{iface.type}</span>
                          </div>
                          {connLink ? (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-accent">
                              <Cable className="w-3 h-3 text-text-muted shrink-0" />
                              <span>Connected to <strong>{remoteDevName}</strong> [{remoteIfaceName}]</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-text-muted mt-0.5 block">Not Connected</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : selectedLink ? (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-lg text-text-primary flex items-center gap-1.5 mb-1.5">
                  <Cable className="w-5 h-5 text-accent" /> Cable Details
                </h3>
                <StatusBadge status={selectedLink.cable.status} />
              </div>

              <Card className="bg-surface-secondary border-border shadow-none">
                <CardContent className="p-3.5 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Cable Type:</span>
                    <span className="font-semibold text-text-primary capitalize">{selectedLink.cable.type || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Length:</span>
                    <span className="font-semibold text-text-primary">
                      {selectedLink.cable.length ? `${selectedLink.cable.length} ${selectedLink.cable.lengthUnit || "m"}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Color:</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full border border-border/80" style={{ backgroundColor: selectedLink.cable.color }} />
                      <span className="text-xs font-mono">{selectedLink.cable.color}</span>
                    </div>
                  </div>
                  {selectedLink.cable.description && (
                    <div className="border-t border-border/40 pt-2.5 mt-1.5">
                      <span className="text-text-muted block text-xs mb-1">Description:</span>
                      <p className="text-text-primary text-xs">{selectedLink.cable.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* A/B Side Info */}
              <div className="space-y-3">
                <div className="p-3 rounded bg-surface-secondary border border-border/60">
                  <span className="text-[10px] text-text-muted font-bold block uppercase mb-1">A Side Connection</span>
                  <div className="text-sm font-semibold text-text-primary">
                    {devices.find((d: any) => d.id === selectedLink.source)?.name || "Unknown"}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    Interface: {selectedLink.sourceInterface.name} ({selectedLink.sourceInterface.type})
                  </div>
                </div>

                <div className="p-3 rounded bg-surface-secondary border border-border/60">
                  <span className="text-[10px] text-text-muted font-bold block uppercase mb-1">B Side Connection</span>
                  <div className="text-sm font-semibold text-text-primary">
                    {devices.find((d: any) => d.id === selectedLink.target)?.name || "Unknown"}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    Interface: {selectedLink.targetInterface.name} ({selectedLink.targetInterface.type})
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <Maximize2 className="w-10 h-10 mx-auto mb-2 opacity-40 animate-pulse" />
              <p className="text-sm">Click a node or cable connection on the map to explore details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
