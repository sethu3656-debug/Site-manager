import { mysqlTable, serial, varchar, text, timestamp, boolean, json, int, decimal, mysqlEnum, bigint, index, date } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  avatar: varchar("avatar", { length: 500 }),
  role: mysqlEnum("role", ["admin", "editor", "viewer"]).default("viewer").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  password: varchar("password", { length: 255 }),
  unionId: varchar("union_id", { length: 255 }).unique(),
  lastSignInAt: timestamp("last_sign_in_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = mysqlTable("sessions", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const groups = mysqlTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userGroups = mysqlTable("user_groups", {
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  groupId: bigint("group_id", { mode: "number", unsigned: true }).references(() => groups.id).notNull(),
}, (table) => [index("idx_user_groups_user").on(table.userId), index("idx_user_groups_group").on(table.groupId)]);

export const tenantGroups = mysqlTable("tenant_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tenants = mysqlTable("tenants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  groupId: bigint("group_id", { mode: "number", unsigned: true }).references(() => tenantGroups.id),
  description: text("description"),
  comments: text("comments"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const regions = mysqlTable("regions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  description: text("description"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const siteGroups = mysqlTable("site_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  description: text("description"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sites = mysqlTable("sites", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  status: mysqlEnum("status", ["planned", "staging", "active", "decommissioning", "retired"]).default("active").notNull(),
  regionId: bigint("region_id", { mode: "number", unsigned: true }).references(() => regions.id),
  siteGroupId: bigint("site_group_id", { mode: "number", unsigned: true }).references(() => siteGroups.id),
  timeZone: varchar("time_zone", { length: 100 }),
  physicalAddress: text("physical_address"),
  shippingAddress: text("shipping_address"),
  latitude: decimal("latitude", { precision: 8, scale: 6 }),
  longitude: decimal("longitude", { precision: 9, scale: 6 }),
  description: text("description"),
  comments: text("comments"),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [index("idx_sites_region").on(table.regionId), index("idx_sites_tenant").on(table.tenantId)]);

export const locations = mysqlTable("locations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  siteId: bigint("site_id", { mode: "number", unsigned: true }).references(() => sites.id).notNull(),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["planned", "staging", "active", "decommissioning", "retired"]).default("active").notNull(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  description: text("description"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rackRoles = mysqlTable("rack_roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  color: varchar("color", { length: 7 }).default("#3B82F6").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const racks = mysqlTable("racks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["reserved", "available", "planned", "active", "deprecated"]).default("active").notNull(),
  siteId: bigint("site_id", { mode: "number", unsigned: true }).references(() => sites.id).notNull(),
  locationId: bigint("location_id", { mode: "number", unsigned: true }).references(() => locations.id),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  roleId: bigint("role_id", { mode: "number", unsigned: true }).references(() => rackRoles.id),
  serial: varchar("serial", { length: 255 }),
  assetTag: varchar("asset_tag", { length: 255 }).unique(),
  type: mysqlEnum("type", ["2-post-frame", "4-post-frame", "4-post-cabinet", "wall-frame", "wall-cabinet"]),
  width: mysqlEnum("width", ["19", "21", "23"]).default("19").notNull(),
  uHeight: int("u_height").default(42).notNull(),
  descUnits: boolean("desc_units").default(false).notNull(),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const manufacturers = mysqlTable("manufacturers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const platforms = mysqlTable("platforms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  manufacturerId: bigint("manufacturer_id", { mode: "number", unsigned: true }).references(() => manufacturers.id),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deviceRoles = mysqlTable("device_roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  color: varchar("color", { length: 7 }).default("#3B82F6").notNull(),
  vmRole: boolean("vm_role").default(false).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deviceTypes = mysqlTable("device_types", {
  id: serial("id").primaryKey(),
  model: varchar("model", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  manufacturerId: bigint("manufacturer_id", { mode: "number", unsigned: true }).references(() => manufacturers.id).notNull(),
  partNumber: varchar("part_number", { length: 255 }),
  uHeight: int("u_height").default(1).notNull(),
  isFullDepth: boolean("is_full_depth").default(true).notNull(),
  airflow: mysqlEnum("airflow", ["front-to-rear", "rear-to-front", "left-to-right", "right-to-left", "passive", "mixed"]),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const devices = mysqlTable("devices", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  status: mysqlEnum("status", ["offline", "active", "planned", "staged", "failed", "inventory", "decommissioning"]).default("active").notNull(),
  deviceTypeId: bigint("device_type_id", { mode: "number", unsigned: true }).references(() => deviceTypes.id).notNull(),
  roleId: bigint("role_id", { mode: "number", unsigned: true }).references(() => deviceRoles.id).notNull(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  platformId: bigint("platform_id", { mode: "number", unsigned: true }).references(() => platforms.id),
  siteId: bigint("site_id", { mode: "number", unsigned: true }).references(() => sites.id).notNull(),
  locationId: bigint("location_id", { mode: "number", unsigned: true }).references(() => locations.id),
  rackId: bigint("rack_id", { mode: "number", unsigned: true }).references(() => racks.id),
  position: decimal("position", { precision: 10, scale: 4 }),
  face: mysqlEnum("face", ["front", "rear"]),
  serial: varchar("serial", { length: 255 }),
  assetTag: varchar("asset_tag", { length: 255 }).unique(),
  airflow: mysqlEnum("airflow", ["front-to-rear", "rear-to-front", "left-to-right", "right-to-left", "passive", "mixed"]),
  primaryIp4Id: bigint("primary_ip4_id", { mode: "number", unsigned: true }),
  primaryIp6Id: bigint("primary_ip6_id", { mode: "number", unsigned: true }),
  description: text("description"),
  comments: text("comments"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [index("idx_devices_site").on(table.siteId), index("idx_devices_rack").on(table.rackId), index("idx_devices_tenant").on(table.tenantId), index("idx_devices_type").on(table.deviceTypeId)]);

export const interfaces = mysqlTable("interfaces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  deviceId: bigint("device_id", { mode: "number", unsigned: true }).references(() => devices.id),
  type: varchar("type", { length: 100 }).default("1000base-t").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  macAddress: varchar("mac_address", { length: 17 }),
  mtu: int("mtu"),
  mgmtOnly: boolean("mgmt_only").default(false).notNull(),
  description: text("description"),
  mode: mysqlEnum("mode", ["access", "tagged", "tagged-all"]),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rirs = mysqlTable("rirs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  isPrivate: boolean("is_private").default(false).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aggregates = mysqlTable("aggregates", {
  id: serial("id").primaryKey(),
  prefix: varchar("prefix", { length: 255 }).notNull(),
  rirId: bigint("rir_id", { mode: "number", unsigned: true }).references(() => rirs.id).notNull(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  dateAdded: date("date_added"),
  description: text("description"),
  comments: text("comments"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roles = mysqlTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vrfs = mysqlTable("vrfs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  rd: varchar("rd", { length: 255 }).unique(),
  enforceUnique: boolean("enforce_unique").default(true).notNull(),
  description: text("description"),
  comments: text("comments"),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const prefixes = mysqlTable("prefixes", {
  id: serial("id").primaryKey(),
  prefix: varchar("prefix", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["container", "active", "reserved", "deprecated"]).default("active").notNull(),
  vrfId: bigint("vrf_id", { mode: "number", unsigned: true }).references(() => vrfs.id),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  vlanId: bigint("vlan_id", { mode: "number", unsigned: true }),
  roleId: bigint("role_id", { mode: "number", unsigned: true }).references(() => roles.id),
  isPool: boolean("is_pool").default(false).notNull(),
  markUtilized: boolean("mark_utilized").default(false).notNull(),
  description: text("description"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [index("idx_prefixes_vrf").on(table.vrfId), index("idx_prefixes_tenant").on(table.tenantId)]);

export const ipAddresses = mysqlTable("ip_addresses", {
  id: serial("id").primaryKey(),
  address: varchar("address", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "reserved", "deprecated", "dhcp", "slaac"]).default("active").notNull(),
  vrfId: bigint("vrf_id", { mode: "number", unsigned: true }).references(() => vrfs.id),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  roleId: bigint("role_id", { mode: "number", unsigned: true }).references(() => roles.id),
  dnsName: varchar("dns_name", { length: 255 }),
  assignedObjectType: varchar("assigned_object_type", { length: 100 }),
  assignedObjectId: bigint("assigned_object_id", { mode: "number", unsigned: true }),
  description: text("description"),
  comments: text("comments"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [index("idx_ip_vrf").on(table.vrfId)]);

export const ipRanges = mysqlTable("ip_ranges", {
  id: serial("id").primaryKey(),
  startAddress: varchar("start_address", { length: 255 }).notNull(),
  endAddress: varchar("end_address", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "reserved", "deprecated"]).default("active").notNull(),
  vrfId: bigint("vrf_id", { mode: "number", unsigned: true }).references(() => vrfs.id),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  roleId: bigint("role_id", { mode: "number", unsigned: true }).references(() => roles.id),
  description: text("description"),
  comments: text("comments"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vlans = mysqlTable("vlans", {
  id: serial("id").primaryKey(),
  vid: int("vid").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "reserved", "deprecated"]).default("active").notNull(),
  roleId: bigint("role_id", { mode: "number", unsigned: true }).references(() => roles.id),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  vlanGroupId: bigint("vlan_group_id", { mode: "number", unsigned: true }).references(() => vlanGroups.id),
  description: text("description"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vlanGroups = mysqlTable("vlan_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  minVid: int("min_vid").default(1).notNull(),
  maxVid: int("max_vid").default(4094).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const asns = mysqlTable("asns", {
  id: serial("id").primaryKey(),
  asn: bigint("asn", { mode: "number", unsigned: true }).notNull().unique(),
  rirId: bigint("rir_id", { mode: "number", unsigned: true }).references(() => rirs.id).notNull(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  description: text("description"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const services = mysqlTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  protocol: mysqlEnum("protocol", ["tcp", "udp", "sctp"]).notNull(),
  ports: json("ports").notNull(),
  deviceId: bigint("device_id", { mode: "number", unsigned: true }).references(() => devices.id),
  virtualMachineId: bigint("virtual_machine_id", { mode: "number", unsigned: true }).references(() => virtualMachines.id),
  description: text("description"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const providers = mysqlTable("providers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  portalUrl: varchar("portal_url", { length: 500 }),
  description: text("description"),
  comments: text("comments"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const circuitTypes = mysqlTable("circuit_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  color: varchar("color", { length: 7 }).default("#3B82F6").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const circuits = mysqlTable("circuits", {
  id: serial("id").primaryKey(),
  cid: varchar("cid", { length: 255 }).notNull(),
  providerId: bigint("provider_id", { mode: "number", unsigned: true }).references(() => providers.id).notNull(),
  typeId: bigint("type_id", { mode: "number", unsigned: true }).references(() => circuitTypes.id).notNull(),
  status: mysqlEnum("status", ["planned", "provisioning", "active", "offline", "deprovisioning", "decommissioning"]).default("active").notNull(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  installDate: date("install_date"),
  commitRate: bigint("commit_rate", { mode: "number", unsigned: true }),
  description: text("description"),
  comments: text("comments"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clusterTypes = mysqlTable("cluster_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clusterGroups = mysqlTable("cluster_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clusters = mysqlTable("clusters", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  typeId: bigint("type_id", { mode: "number", unsigned: true }).references(() => clusterTypes.id).notNull(),
  groupId: bigint("group_id", { mode: "number", unsigned: true }).references(() => clusterGroups.id),
  status: mysqlEnum("status", ["planned", "staging", "active", "decommissioning", "retired"]).default("active").notNull(),
  siteId: bigint("site_id", { mode: "number", unsigned: true }).references(() => sites.id),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  description: text("description"),
  comments: text("comments"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const virtualMachines = mysqlTable("virtual_machines", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["offline", "active", "planned", "staged", "failed", "decommissioning"]).default("active").notNull(),
  clusterId: bigint("cluster_id", { mode: "number", unsigned: true }).references(() => clusters.id),
  siteId: bigint("site_id", { mode: "number", unsigned: true }).references(() => sites.id),
  deviceId: bigint("device_id", { mode: "number", unsigned: true }).references(() => devices.id),
  roleId: bigint("role_id", { mode: "number", unsigned: true }).references(() => deviceRoles.id),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  platformId: bigint("platform_id", { mode: "number", unsigned: true }).references(() => platforms.id),
  vcpus: decimal("vcpus", { precision: 10, scale: 4 }),
  memory: bigint("memory", { mode: "number", unsigned: true }),
  disk: bigint("disk", { mode: "number", unsigned: true }),
  description: text("description"),
  comments: text("comments"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ikePolicies = mysqlTable("ike_policies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  version: mysqlEnum("version", ["ikev1", "ikev2"]).default("ikev2").notNull(),
  mode: mysqlEnum("mode", ["main", "aggressive"]),
  presharedKey: text("preshared_key"),
  description: text("description"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ipsecPolicies = mysqlTable("ipsec_policies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  pfsGroup: mysqlEnum("pfs_group", ["group1", "group2", "group5", "group14", "group15", "group16", "group19", "group20", "group21"]),
  description: text("description"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ipsecProfiles = mysqlTable("ipsec_profiles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  mode: mysqlEnum("mode", ["esp", "ah", "esp-ah"]).default("esp").notNull(),
  ikePolicyId: bigint("ike_policy_id", { mode: "number", unsigned: true }).references(() => ikePolicies.id),
  ipsecPolicyId: bigint("ipsec_policy_id", { mode: "number", unsigned: true }).references(() => ipsecPolicies.id),
  description: text("description"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tunnelGroups = mysqlTable("tunnel_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tunnels = mysqlTable("tunnels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["planned", "provisioning", "active", "closed"]).default("active").notNull(),
  groupId: bigint("group_id", { mode: "number", unsigned: true }).references(() => tunnelGroups.id),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  encapsulation: mysqlEnum("encapsulation", ["ipsec", "gre", "ip-ip"]).default("ipsec").notNull(),
  ipsecProfileId: bigint("ipsec_profile_id", { mode: "number", unsigned: true }).references(() => ipsecProfiles.id),
  description: text("description"),
  comments: text("comments"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const l2vpns = mysqlTable("l2vpns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: mysqlEnum("type", ["vpws", "vpls", "evpl", "epws", "evpn-vpws", "evpn-vpls"]).default("evpl").notNull(),
  status: mysqlEnum("status", ["planned", "active", "closed"]).default("active").notNull(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  description: text("description"),
  comments: text("comments"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const wirelessLanGroups = mysqlTable("wireless_lan_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wirelessLans = mysqlTable("wireless_lans", {
  id: serial("id").primaryKey(),
  ssid: varchar("ssid", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "reserved", "disabled"]).default("active").notNull(),
  groupId: bigint("group_id", { mode: "number", unsigned: true }).references(() => wirelessLanGroups.id),
  vlanId: bigint("vlan_id", { mode: "number", unsigned: true }).references(() => vlans.id),
  authType: mysqlEnum("auth_type", ["open", "wep", "wpa-personal", "wpa-enterprise"]).default("open").notNull(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  description: text("description"),
  comments: text("comments"),
  customData: json("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contactGroups = mysqlTable("contact_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactRoles = mysqlTable("contact_roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contacts = mysqlTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 255 }),
  address: text("address"),
  title: varchar("title", { length: 255 }),
  groupId: bigint("group_id", { mode: "number", unsigned: true }).references(() => contactGroups.id),
  description: text("description"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = mysqlTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  color: varchar("color", { length: 7 }).default("#3B82F6").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taggedItems = mysqlTable("tagged_items", {
  id: serial("id").primaryKey(),
  tagId: bigint("tag_id", { mode: "number", unsigned: true }).references(() => tags.id).notNull(),
  objectType: varchar("object_type", { length: 100 }).notNull(),
  objectId: bigint("object_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("idx_tagged_object").on(table.objectType, table.objectId)]);

export const customFields = mysqlTable("custom_fields", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  objectTypes: json("object_types").notNull(),
  type: mysqlEnum("type", ["text", "longtext", "integer", "boolean", "date", "url", "json", "select", "multiselect", "object"]).notNull(),
  required: boolean("required").default(false).notNull(),
  defaultValue: text("default_value"),
  choices: json("choices"),
  validationRegex: varchar("validation_regex", { length: 255 }),
  weight: int("weight").default(100).notNull(),
  groupName: varchar("group_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customModules = mysqlTable("custom_modules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  pluralName: varchar("plural_name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  icon: varchar("icon", { length: 100 }).default("box").notNull(),
  color: varchar("color", { length: 7 }).default("#3B82F6").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customModuleFields = mysqlTable("custom_module_fields", {
  id: serial("id").primaryKey(),
  moduleId: bigint("module_id", { mode: "number", unsigned: true }).references(() => customModules.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["text", "longtext", "integer", "decimal", "boolean", "date", "datetime", "url", "email", "json", "select", "multiselect", "object"]).notNull(),
  required: boolean("required").default(false).notNull(),
  defaultValue: text("default_value"),
  choices: json("choices"),
  objectType: varchar("object_type", { length: 100 }),
  helpText: text("help_text"),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customEntities = mysqlTable("custom_entities", {
  id: serial("id").primaryKey(),
  moduleId: bigint("module_id", { mode: "number", unsigned: true }).references(() => customModules.id).notNull(),
  data: json("data").notNull(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id),
  status: mysqlEnum("status", ["active", "inactive", "pending", "archived"]).default("active").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const journalEntries = mysqlTable("journal_entries", {
  id: serial("id").primaryKey(),
  assignedObjectType: varchar("assigned_object_type", { length: 100 }).notNull(),
  assignedObjectId: bigint("assigned_object_id", { mode: "number", unsigned: true }).notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }).references(() => users.id),
  comments: text("comments").notNull(),
  kind: mysqlEnum("kind", ["info", "success", "warning", "danger"]).default("info").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const objectChanges = mysqlTable("object_changes", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id),
  userName: varchar("user_name", { length: 255 }).notNull(),
  action: mysqlEnum("action", ["create", "update", "delete"]).notNull(),
  changedObjectType: varchar("changed_object_type", { length: 100 }).notNull(),
  changedObjectId: bigint("changed_object_id", { mode: "number", unsigned: true }).notNull(),
  objectRepr: varchar("object_repr", { length: 255 }).notNull(),
  prechangeData: json("prechange_data"),
  postchangeData: json("postchange_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const configContexts = mysqlTable("config_contexts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  weight: int("weight").default(1000).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  data: json("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cables = mysqlTable("cables", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 100 }).default("cat6").notNull(),
  status: mysqlEnum("status", ["connected", "planned", "decommissioned"]).default("connected").notNull(),
  length: decimal("length", { precision: 10, scale: 2 }),
  lengthUnit: mysqlEnum("length_unit", ["m", "ft", "in", "cm"]).default("m").notNull(),
  color: varchar("color", { length: 7 }).default("#3B82F6").notNull(),
  aSideObjectType: varchar("a_side_object_type", { length: 100 }).notNull(),
  aSideObjectId: bigint("a_side_object_id", { mode: "number", unsigned: true }).notNull(),
  bSideObjectType: varchar("b_side_object_type", { length: 100 }).notNull(),
  bSideObjectId: bigint("b_side_object_id", { mode: "number", unsigned: true }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Cable = typeof cables.$inferSelect;
export type InsertCable = typeof cables.$inferInsert;
