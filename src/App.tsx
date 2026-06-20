import { Routes, Route } from "react-router";
import { AppShell } from "@/components/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { SiteListPage } from "@/pages/SiteListPage";
import { DeviceListPage } from "@/pages/DeviceListPage";
import { DeviceDetailPage } from "@/pages/DeviceDetailPage";
import { PrefixListPage } from "@/pages/PrefixListPage";
import { IPAddressListPage } from "@/pages/IPAddressListPage";
import { VlanListPage } from "@/pages/VlanListPage";
import { VrfListPage } from "@/pages/VrfListPage";
import { RackListPage } from "@/pages/RackListPage";
import { TenantListPage } from "@/pages/TenantListPage";
import { CircuitListPage } from "@/pages/CircuitListPage";
import { ProviderListPage } from "@/pages/ProviderListPage";
import { ClusterListPage } from "@/pages/ClusterListPage";
import { VirtualMachineListPage } from "@/pages/VirtualMachineListPage";
import { TagListPage } from "@/pages/TagListPage";
import { CustomFieldListPage } from "@/pages/CustomFieldListPage";
import { CustomModuleListPage } from "@/pages/CustomModuleListPage";
import { CustomEntityListPage } from "@/pages/CustomEntityListPage";
import { AggregateListPage } from "@/pages/AggregateListPage";
import { WirelessLanListPage } from "@/pages/WirelessLanListPage";
import { TunnelListPage } from "@/pages/TunnelListPage";
import { L2vpnListPage } from "@/pages/L2vpnListPage";
import { ContactListPage } from "@/pages/ContactListPage";
import { ConfigContextListPage } from "@/pages/ConfigContextListPage";
import { ChangeLogPage } from "@/pages/ChangeLogPage";
import { LoginPage } from "@/pages/LoginPage";
import { SiteDetailPage } from "@/pages/SiteDetailPage";
import { RackDetailPage } from "@/pages/RackDetailPage";
import { DeviceTypeListPage } from "@/pages/DeviceTypeListPage";
import { CableListPage } from "@/pages/CableListPage";
import { ExplorerPage } from "@/pages/ExplorerPage";
import { UserSettingsPage } from "@/pages/UserSettingsPage";
import { TopologyPage } from "@/pages/TopologyPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/sites" element={<SiteListPage />} />
        <Route path="/sites/:id" element={<SiteDetailPage />} />
        <Route path="/devices" element={<DeviceListPage />} />
        <Route path="/devices/:id" element={<DeviceDetailPage />} />
        <Route path="/racks/:id" element={<RackDetailPage />} />
        <Route path="/device-types" element={<DeviceTypeListPage />} />
        <Route path="/cables" element={<CableListPage />} />
        <Route path="/plugins/explorer" element={<ExplorerPage />} />
        <Route path="/plugins/topology" element={<TopologyPage />} />
        <Route path="/settings" element={<UserSettingsPage />} />
        <Route path="/prefixes" element={<PrefixListPage />} />
        <Route path="/ip-addresses" element={<IPAddressListPage />} />
        <Route path="/vlans" element={<VlanListPage />} />
        <Route path="/vrfs" element={<VrfListPage />} />
        <Route path="/racks" element={<RackListPage />} />
        <Route path="/tenants" element={<TenantListPage />} />
        <Route path="/circuits" element={<CircuitListPage />} />
        <Route path="/providers" element={<ProviderListPage />} />
        <Route path="/clusters" element={<ClusterListPage />} />
        <Route path="/virtual-machines" element={<VirtualMachineListPage />} />
        <Route path="/tags" element={<TagListPage />} />
        <Route path="/custom-fields" element={<CustomFieldListPage />} />
        <Route path="/custom-modules" element={<CustomModuleListPage />} />
        <Route path="/custom-modules/:slug/entities" element={<CustomEntityListPage />} />
        <Route path="/aggregates" element={<AggregateListPage />} />
        <Route path="/wireless-lans" element={<WirelessLanListPage />} />
        <Route path="/tunnels" element={<TunnelListPage />} />
        <Route path="/l2vpns" element={<L2vpnListPage />} />
        <Route path="/contacts" element={<ContactListPage />} />
        <Route path="/config-contexts" element={<ConfigContextListPage />} />
        <Route path="/change-log" element={<ChangeLogPage />} />
      </Route>
    </Routes>
  );
}

export default App;
