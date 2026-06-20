import { Outlet, useLocation, Link } from "react-router";
import { useState } from "react";
import {
  Network, LayoutDashboard, Server, Cpu, HardDrive, MapPin,
  Building2, Users, Globe, Zap, Wifi, Shield, Layers,
  Tag, Settings, ChevronLeft, ChevronRight, Search, Bell,
  Plus, ChevronDown, Database, Key, FileText, Activity,
  CircuitBoard, Monitor, Box, Rss, Phone, BookOpen, Clock,
  LogOut
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import isroLogo from "@/assets/isro_logo.svg";

const navSections = [
  {
    title: "OVERVIEW",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    ],
  },
  {
    title: "ORGANIZATION",
    items: [
      { icon: Globe, label: "Sites", path: "/sites" },
      { icon: HardDrive, label: "Racks", path: "/racks" },
      { icon: Building2, label: "Tenants", path: "/tenants" },
      { icon: Phone, label: "Contacts", path: "/contacts" },
    ],
  },
  {
    title: "DEVICES",
    items: [
      { icon: Server, label: "Devices", path: "/devices" },
      { icon: Cpu, label: "Device Types", path: "/device-types" },
      { icon: Layers, label: "Cables", path: "/cables" },
    ],
  },
  {
    title: "IPAM",
    items: [
      { icon: Network, label: "Prefixes", path: "/prefixes" },
      { icon: MapPin, label: "IP Addresses", path: "/ip-addresses" },
      { icon: Layers, label: "VLANs", path: "/vlans" },
      { icon: Database, label: "VRFs", path: "/vrfs" },
      { icon: Globe, label: "Aggregates", path: "/aggregates" },
    ],
  },
  {
    title: "CIRCUITS",
    items: [
      { icon: CircuitBoard, label: "Circuits", path: "/circuits" },
      { icon: Zap, label: "Providers", path: "/providers" },
    ],
  },
  {
    title: "VIRTUALIZATION",
    items: [
      { icon: Monitor, label: "Virtual Machines", path: "/virtual-machines" },
      { icon: Box, label: "Clusters", path: "/clusters" },
    ],
  },
  {
    title: "VPN",
    items: [
      { icon: Shield, label: "Tunnels", path: "/tunnels" },
      { icon: Rss, label: "L2VPNs", path: "/l2vpns" },
    ],
  },
  {
    title: "WIRELESS",
    items: [
      { icon: Wifi, label: "Wireless LANs", path: "/wireless-lans" },
    ],
  },
  {
    title: "CUSTOMIZATION",
    items: [
      { icon: Tag, label: "Tags", path: "/tags" },
      { icon: Settings, label: "Custom Fields", path: "/custom-fields" },
      { icon: PuzzlePiece, label: "Custom Modules", path: "/custom-modules" },
      { icon: BookOpen, label: "Config Contexts", path: "/config-contexts" },
    ],
  },
  {
    title: "PLUGINS",
    items: [
      { icon: Globe, label: "NetBox Explorer", path: "/plugins/explorer" },
      { icon: Network, label: "Topology Viewer", path: "/plugins/topology" },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { icon: Activity, label: "Change Log", path: "/change-log" },
    ],
  },
];

function PuzzlePiece(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z" />
      <path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8" />
      <path d="M15 2v5h5" />
    </svg>
  );
}

export function AppShell() {
  const { user, logout, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  if (isLoading || !user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-text-muted font-medium">Loading Site Manager...</span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-canvas text-text-primary overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`flex-shrink-0 bg-sidebar-bg border-r border-border flex flex-col transition-all duration-200 ${
            collapsed ? "w-16" : "w-60"
          }`}
        >
          {/* Logo */}
          <div className="h-14 flex items-center px-4 border-b border-border gap-2">
            <img src={isroLogo} className="w-8 h-8 flex-shrink-0 object-contain" alt="ISRO Logo" />
            {!collapsed && (
              <span className="font-bold text-[14px] tracking-tight leading-tight uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                Site Manager
              </span>
            )}
          </div>

          {/* Search */}
          {!collapsed && (
            <div className="px-3 py-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search objects..."
                  className="w-full h-9 bg-surface-secondary border border-border rounded-md pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2">
            {navSections.map((section) => (
              <div key={section.title} className="mb-3">
                {!collapsed && (
                  <div className="px-4 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return collapsed ? (
                    <Tooltip key={item.path} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.path}
                          className={`flex items-center justify-center h-10 mx-1.5 rounded-md transition-colors ${
                            isActive
                              ? "bg-sidebar-active text-accent border-l-2 border-accent"
                              : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
                          }`}
                        >
                          <item.icon className="w-[18px] h-[18px]" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 h-9 mx-2 px-3 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-active text-accent font-medium border-l-2 border-accent"
                          : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
                      }`}
                    >
                      <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Collapse toggle */}
          <div className="border-t border-border p-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center w-full h-8 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-tertiary transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="h-14 bg-surface-primary border-b border-border flex items-center justify-between px-5 flex-shrink-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-muted">Site Manager</span>
              <ChevronDown className="w-3 h-3 text-text-muted rotate-[-90deg]" />
              <span className="text-text-primary font-medium capitalize">
                {location.pathname === "/" ? "Dashboard" : location.pathname.slice(1).replace(/-/g, " ").replace(/\//g, " > ")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 ml-2 pl-3 border-l border-border hover:opacity-80 focus:outline-none text-left">
                    <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center font-semibold text-accent capitalize shrink-0 overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <div className="hidden md:block">
                      <div className="text-sm font-medium text-text-primary leading-tight">{user.name}</div>
                      <div className="text-xs text-text-muted capitalize leading-none mt-0.5">{user.role}</div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-surface-primary border border-border">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/settings" className="flex items-center w-full px-2 py-1.5 text-sm text-text-primary hover:bg-surface-secondary rounded-md">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>User Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 border-t border-border/50 mt-1 pt-2 rounded-none rounded-b-md"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-canvas">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
