import { createRouter } from "./middleware";
import { authRouter } from "./auth-router";
import { dashboardRouter } from "./routers/dashboard";
import { siteRouter } from "./routers/site";
import { deviceRouter } from "./routers/device";
import { prefixRouter } from "./routers/prefix";
import { ipAddressRouter } from "./routers/ip-address";
import { vlanRouter } from "./routers/vlan";
import { vrfRouter } from "./routers/vrf";
import { rackRouter } from "./routers/rack";
import { tenantRouter } from "./routers/tenant";
import { manufacturerRouter } from "./routers/manufacturer";
import { deviceTypeRouter } from "./routers/device-type";
import { deviceRoleRouter } from "./routers/device-role";
import { platformRouter } from "./routers/platform";
import { circuitRouter } from "./routers/circuit";
import { providerRouter } from "./routers/provider";
import { clusterRouter } from "./routers/cluster";
import { virtualMachineRouter } from "./routers/virtual-machine";
import { tagRouter } from "./routers/tag";
import { customFieldRouter } from "./routers/custom-field";
import { customModuleRouter } from "./routers/custom-module";
import { customEntityRouter } from "./routers/custom-entity";
import { regionRouter } from "./routers/region";
import { locationRouter } from "./routers/location";
import { changeLogRouter } from "./routers/change-log";
import { configContextRouter } from "./routers/config-context";
import { contactRouter } from "./routers/contact";
import { wirelessLanRouter } from "./routers/wireless-lan";
import { tunnelRouter } from "./routers/tunnel";
import { l2vpnRouter } from "./routers/l2vpn";
import { serviceRouter } from "./routers/service";
import { aggregateRouter } from "./routers/aggregate";
import { interfaceRouter } from "./routers/interface";
import { cableRouter } from "./routers/cable";
import { siteGroupRouter } from "./routers/site-group";
import { rackRoleRouter } from "./routers/rack-role";
import { roleRouter } from "./routers/role";

export const appRouter = createRouter({
  auth: authRouter,
  dashboard: dashboardRouter,
  site: siteRouter,
  device: deviceRouter,
  prefix: prefixRouter,
  ipAddress: ipAddressRouter,
  vlan: vlanRouter,
  vrf: vrfRouter,
  rack: rackRouter,
  tenant: tenantRouter,
  manufacturer: manufacturerRouter,
  deviceType: deviceTypeRouter,
  deviceRole: deviceRoleRouter,
  platform: platformRouter,
  circuit: circuitRouter,
  provider: providerRouter,
  cluster: clusterRouter,
  virtualMachine: virtualMachineRouter,
  tag: tagRouter,
  customField: customFieldRouter,
  customModule: customModuleRouter,
  customEntity: customEntityRouter,
  region: regionRouter,
  location: locationRouter,
  changeLog: changeLogRouter,
  configContext: configContextRouter,
  contact: contactRouter,
  wirelessLan: wirelessLanRouter,
  tunnel: tunnelRouter,
  l2vpn: l2vpnRouter,
  service: serviceRouter,
  aggregate: aggregateRouter,
  interface: interfaceRouter,
  cable: cableRouter,
  siteGroup: siteGroupRouter,
  rackRole: rackRoleRouter,
  role: roleRouter,
});

export type AppRouter = typeof appRouter;
