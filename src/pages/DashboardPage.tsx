import { Link } from "react-router";
import { useEffect, useState } from "react";
import {
  Globe, HardDrive, Server, Network, MapPin, Database,
  Layers, Shield, Monitor, CircuitBoard, Users, Zap,
  ArrowUpRight, Activity, Clock
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { StatusBadge } from "@/components/StatusBadge";

const moduleColors: Record<string, string> = {
  sites: "#3B82F6", racks: "#10B981", devices: "#8B5CF6",
  prefixes: "#3B82F6", ipAddresses: "#06B6D4", vlans: "#F59E0B",
  vrfs: "#EC4899", circuits: "#F59E0B", virtualMachines: "#8B5CF6",
  clusters: "#06B6D4", tenants: "#EC4899",
};

export function DashboardPage() {
  const statsQuery = trpc.dashboard.stats.useQuery();
  const changesQuery = trpc.dashboard.recentChanges.useQuery();
  const deviceStatusQuery = trpc.dashboard.deviceStatus.useQuery();
  const ipUtilQuery = trpc.dashboard.ipUtilization.useQuery();
  const utils = trpc.useUtils();

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (statsQuery.data) setStats(statsQuery.data);
    // Fallback demo data
    if (!statsQuery.data) {
      setStats({
        sites: 4, racks: 4, devices: 9, prefixes: 9,
        ipAddresses: 10, vlans: 5, vrfs: 3, circuits: 4,
        virtualMachines: 5, clusters: 2, tenants: 4,
      });
    }
  }, [statsQuery.data]);

  const statCards = stats ? [
    { label: "Sites", value: stats.sites, icon: Globe, path: "/sites", color: moduleColors.sites },
    { label: "Racks", value: stats.racks, icon: HardDrive, path: "/racks", color: moduleColors.racks },
    { label: "Devices", value: stats.devices, icon: Server, path: "/devices", color: moduleColors.devices },
    { label: "Prefixes", value: stats.prefixes, icon: Network, path: "/prefixes", color: moduleColors.prefixes },
    { label: "IP Addresses", value: stats.ipAddresses, icon: MapPin, path: "/ip-addresses", color: moduleColors.ipAddresses },
    { label: "VLANs", value: stats.vlans, icon: Layers, path: "/vlans", color: moduleColors.vlans },
    { label: "VRFs", value: stats.vrfs, icon: Database, path: "/vrfs", color: moduleColors.vrfs },
    { label: "Circuits", value: stats.circuits, icon: CircuitBoard, path: "/circuits", color: moduleColors.circuits },
    { label: "Virtual Machines", value: stats.virtualMachines, icon: Monitor, path: "/virtual-machines", color: moduleColors.virtualMachines },
    { label: "Clusters", value: stats.clusters, icon: Shield, path: "/clusters", color: moduleColors.clusters },
    { label: "Tenants", value: stats.tenants, icon: Users, path: "/tenants", color: moduleColors.tenants },
  ] : [];

  const recentChanges = changesQuery.data || [
    { id: 1, userName: "admin", action: "create", changedObjectType: "devices", objectRepr: "core-sw-01", createdAt: new Date().toISOString() },
    { id: 2, userName: "admin", action: "create", changedObjectType: "devices", objectRepr: "edge-fw-01", createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, userName: "jdoe", action: "update", changedObjectType: "ip_addresses", objectRepr: "10.0.1.50/24", createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 4, userName: "admin", action: "create", changedObjectType: "prefixes", objectRepr: "10.0.1.0/24", createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];

  const deviceStatus = deviceStatusQuery.data || [
    { status: "active", count: 7 },
    { status: "planned", count: 1 },
    { status: "offline", count: 1 },
  ];

  const ipUtil = ipUtilQuery.data || [
    { prefix: "10.0.1.0/24", utilized: 45 },
    { prefix: "10.0.2.0/24", utilized: 12 },
    { prefix: "172.16.1.0/24", utilized: 30 },
    { prefix: "192.168.1.0/24", utilized: 78 },
  ];

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1" style={{ fontFamily: "var(--font-heading)" }}>Dashboard</h1>
        <p className="text-text-secondary text-sm">Overview of your infrastructure</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            to={stat.path}
            className="bg-surface-primary border border-border rounded-lg p-4 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}18` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
            </div>
            <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
            <div className="text-xs text-text-muted mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Status */}
        <div className="bg-surface-primary border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-accent" />
            <h2 className="text-base font-semibold text-text-primary">Device Status</h2>
          </div>
          <div className="space-y-3">
            {deviceStatus.map((ds: any) => (
              <div key={ds.status} className="flex items-center gap-3">
                <StatusBadge status={ds.status} />
                <div className="flex-1 h-2 bg-surface-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(ds.count / (stats?.devices || 1)) * 100}%`,
                      backgroundColor: moduleColors.devices,
                    }}
                  />
                </div>
                <span className="text-sm text-text-secondary w-8 text-right">{ds.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* IP Utilization */}
        <div className="bg-surface-primary border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-5 h-5 text-accent" />
            <h2 className="text-base font-semibold text-text-primary">IP Prefix Utilization</h2>
          </div>
          <div className="space-y-3">
            {ipUtil.map((ip: any) => (
              <div key={ip.prefix} className="flex items-center gap-3">
                <span className="text-sm text-text-primary w-32 truncate font-mono">{ip.prefix}</span>
                <div className="flex-1 h-2 bg-surface-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${ip.utilized}%`,
                      backgroundColor: ip.utilized > 80 ? "#EF4444" : ip.utilized > 50 ? "#F59E0B" : "#10B981",
                    }}
                  />
                </div>
                <span className="text-sm text-text-secondary w-12 text-right">{ip.utilized}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Changes */}
        <div className="bg-surface-primary border border-border rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              <h2 className="text-base font-semibold text-text-primary">Recent Changes</h2>
            </div>
            <Link to="/change-log" className="text-sm text-accent hover:text-accent-light">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-3 py-2">Time</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-3 py-2">User</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-3 py-2">Action</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-3 py-2">Object</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase px-3 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {recentChanges.map((change: any) => (
                  <tr key={change.id} className="border-b border-border/50 hover:bg-surface-tertiary/30">
                    <td className="px-3 py-2.5 text-sm text-text-muted whitespace-nowrap">
                      {new Date(change.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-accent/10 text-accent">
                        {change.userName}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                        change.action === "create" ? "bg-[#10B981]/15 text-[#10B981]" :
                        change.action === "update" ? "bg-[#F59E0B]/15 text-[#F59E0B]" :
                        "bg-[#EF4444]/15 text-[#EF4444]"
                      }`}>
                        {change.action}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-text-secondary">{change.changedObjectType}</td>
                    <td className="px-3 py-2.5 text-sm text-text-primary font-mono">{change.objectRepr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
