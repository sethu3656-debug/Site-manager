import { getDb } from "../api/queries/connection";
import * as schema from "./schema";

async function seed() {
  const db = getDb();

  // Seed Users
  await db.insert(schema.users).values([
    {
      username: "admin",
      email: "admin@sitemanager.local",
      name: "Admin User",
      role: "admin",
      status: "active",
      password: "admin",
      unionId: "admin",
    }
  ]);

  // Seed Regions
  const regionIds = await db.insert(schema.regions).values([
    { name: "North America", slug: "north-america", description: "North American region" },
    { name: "Europe", slug: "europe", description: "European region" },
    { name: "Asia Pacific", slug: "asia-pacific", description: "Asia Pacific region" },
  ]).$returningId();

  // Seed Sites
  const siteIds = await db.insert(schema.sites).values([
    { name: "NYC-DC1", slug: "nyc-dc1", status: "active", regionId: regionIds[0].id, description: "Primary datacenter in New York City", physicalAddress: "123 Broadway, New York, NY 10001" },
    { name: "LON-DC1", slug: "lon-dc1", status: "active", regionId: regionIds[1].id, description: "Primary datacenter in London", physicalAddress: "45 Baker Street, London, UK" },
    { name: "SIN-DC1", slug: "sin-dc1", status: "active", regionId: regionIds[2].id, description: "Primary datacenter in Singapore", physicalAddress: "78 Marina Bay, Singapore" },
    { name: "LA-DC1", slug: "la-dc1", status: "staging", regionId: regionIds[0].id, description: "Los Angeles datacenter" },
  ]).$returningId();

  // Seed Tenant Groups
  const tenantGroupIds = await db.insert(schema.tenantGroups).values([
    { name: "Internal", slug: "internal" },
    { name: "External", slug: "external" },
  ]).$returningId();

  // Seed Tenants
  const tenantIds = await db.insert(schema.tenants).values([
    { name: "Infrastructure", slug: "infrastructure", groupId: tenantGroupIds[0].id, description: "Core infrastructure team" },
    { name: "Security", slug: "security", groupId: tenantGroupIds[0].id, description: "Security operations" },
    { name: "Development", slug: "development", groupId: tenantGroupIds[0].id, description: "Application development" },
    { name: "Customer A", slug: "customer-a", groupId: tenantGroupIds[1].id, description: "External customer A" },
  ]).$returningId();

  // Seed Rack Roles
  const rackRoleIds = await db.insert(schema.rackRoles).values([
    { name: "Compute", slug: "compute", color: "#3B82F6" },
    { name: "Network", slug: "network", color: "#10B981" },
    { name: "Storage", slug: "storage", color: "#F59E0B" },
    { name: "Mixed", slug: "mixed", color: "#8B5CF6" },
  ]).$returningId();

  // Seed Racks
  const rackIds = await db.insert(schema.racks).values([
    { name: "Rack-A01", status: "active", siteId: siteIds[0].id, roleId: rackRoleIds[0].id, uHeight: 42, tenantId: tenantIds[0].id },
    { name: "Rack-A02", status: "active", siteId: siteIds[0].id, roleId: rackRoleIds[1].id, uHeight: 42, tenantId: tenantIds[0].id },
    { name: "Rack-B01", status: "active", siteId: siteIds[0].id, roleId: rackRoleIds[2].id, uHeight: 42, tenantId: tenantIds[1].id },
    { name: "Rack-A01", status: "active", siteId: siteIds[1].id, roleId: rackRoleIds[3].id, uHeight: 48, tenantId: tenantIds[2].id },
  ]).$returningId();

  // Seed Manufacturers
  const mfgIds = await db.insert(schema.manufacturers).values([
    { name: "Cisco", slug: "cisco", description: "Cisco Systems" },
    { name: "Juniper", slug: "juniper", description: "Juniper Networks" },
    { name: "Palo Alto", slug: "palo-alto", description: "Palo Alto Networks" },
    { name: "Arista", slug: "arista", description: "Arista Networks" },
    { name: "Dell", slug: "dell", description: "Dell Technologies" },
    { name: "HPE", slug: "hpe", description: "Hewlett Packard Enterprise" },
  ]).$returningId();

  // Seed Platforms
  const platformIds = await db.insert(schema.platforms).values([
    { name: "Cisco IOS-XE", slug: "cisco-ios-xe", manufacturerId: mfgIds[0].id },
    { name: "Cisco NX-OS", slug: "cisco-nx-os", manufacturerId: mfgIds[0].id },
    { name: "JunOS", slug: "junos", manufacturerId: mfgIds[1].id },
    { name: "PAN-OS", slug: "pan-os", manufacturerId: mfgIds[2].id },
    { name: "Arista EOS", slug: "arista-eos", manufacturerId: mfgIds[3].id },
    { name: "Ubuntu 22.04", slug: "ubuntu-22-04", manufacturerId: mfgIds[4].id },
  ]).$returningId();

  // Seed Device Roles
  const roleIds = await db.insert(schema.deviceRoles).values([
    { name: "Core Switch", slug: "core-switch", color: "#EF4444" },
    { name: "Distribution Switch", slug: "distribution-switch", color: "#F59E0B" },
    { name: "Access Switch", slug: "access-switch", color: "#10B981" },
    { name: "Firewall", slug: "firewall", color: "#8B5CF6" },
    { name: "Router", slug: "router", color: "#3B82F6" },
    { name: "Server", slug: "server", color: "#06B6D4" },
    { name: "Storage", slug: "storage", color: "#EC4899" },
  ]).$returningId();

  // Seed Device Types
  const dtIds = await db.insert(schema.deviceTypes).values([
    { model: "Catalyst 9300-48P", slug: "c9300-48p", manufacturerId: mfgIds[0].id, uHeight: 1 },
    { model: "Nexus 9336C-FX2", slug: "nexus-9336c-fx2", manufacturerId: mfgIds[0].id, uHeight: 1 },
    { model: "PA-5220", slug: "pa-5220", manufacturerId: mfgIds[2].id, uHeight: 2 },
    { model: "MX480", slug: "mx480", manufacturerId: mfgIds[1].id, uHeight: 8 },
    { model: "PowerEdge R750", slug: "poweredge-r750", manufacturerId: mfgIds[4].id, uHeight: 2 },
    { model: "7280SR-48C6", slug: "7280sr-48c6", manufacturerId: mfgIds[3].id, uHeight: 1 },
    { model: "ProLiant DL380 Gen10", slug: "proliant-dl380-g10", manufacturerId: mfgIds[5].id, uHeight: 2 },
  ]).$returningId();

  // Seed Devices
  const deviceIds = await db.insert(schema.devices).values([
    { name: "core-sw-01", status: "active", deviceTypeId: dtIds[0].id, roleId: roleIds[0].id, tenantId: tenantIds[0].id, platformId: platformIds[0].id, siteId: siteIds[0].id, rackId: rackIds[0].id, position: "10", face: "front", serial: "FJC2348L0E8", assetTag: "INV-2024-0042", airflow: "front-to-rear", description: "Core switch for NYC datacenter - primary" },
    { name: "core-sw-02", status: "active", deviceTypeId: dtIds[0].id, roleId: roleIds[0].id, tenantId: tenantIds[0].id, platformId: platformIds[0].id, siteId: siteIds[0].id, rackId: rackIds[0].id, position: "11", face: "front", serial: "FJC2348L0E9", assetTag: "INV-2024-0043", airflow: "front-to-rear", description: "Core switch for NYC datacenter - secondary" },
    { name: "edge-fw-01", status: "active", deviceTypeId: dtIds[2].id, roleId: roleIds[3].id, tenantId: tenantIds[1].id, platformId: platformIds[3].id, siteId: siteIds[0].id, rackId: rackIds[1].id, position: "5", face: "front", serial: "PA5220-A12345", assetTag: "INV-2024-0010", airflow: "front-to-rear", description: "Primary edge firewall" },
    { name: "dist-sw-01", status: "active", deviceTypeId: dtIds[5].id, roleId: roleIds[1].id, tenantId: tenantIds[0].id, platformId: platformIds[4].id, siteId: siteIds[0].id, rackId: rackIds[1].id, position: "20", face: "front", serial: "7280SR-A1B2C3", assetTag: "INV-2024-0050", description: "Distribution switch" },
    { name: "wan-rtr-01", status: "active", deviceTypeId: dtIds[3].id, roleId: roleIds[4].id, tenantId: tenantIds[0].id, platformId: platformIds[2].id, siteId: siteIds[0].id, rackId: rackIds[1].id, position: "1", face: "front", serial: "MX480-WAN01", assetTag: "INV-2024-0020", airflow: "front-to-rear", description: "WAN router - primary" },
    { name: "app-srv-01", status: "active", deviceTypeId: dtIds[4].id, roleId: roleIds[5].id, tenantId: tenantIds[2].id, platformId: platformIds[5].id, siteId: siteIds[0].id, rackId: rackIds[0].id, position: "25", face: "front", serial: "R750-APP01", assetTag: "INV-2024-0100", description: "Application server" },
    { name: "app-srv-02", status: "active", deviceTypeId: dtIds[4].id, roleId: roleIds[5].id, tenantId: tenantIds[2].id, platformId: platformIds[5].id, siteId: siteIds[0].id, rackId: rackIds[0].id, position: "27", face: "front", serial: "R750-APP02", assetTag: "INV-2024-0101", description: "Application server" },
    { name: "sto-srv-01", status: "active", deviceTypeId: dtIds[6].id, roleId: roleIds[6].id, tenantId: tenantIds[2].id, platformId: platformIds[5].id, siteId: siteIds[0].id, rackId: rackIds[2].id, position: "1", face: "front", serial: "DL380-STOR01", assetTag: "INV-2024-0200", description: "Storage server" },
    { name: "core-sw-lon-01", status: "active", deviceTypeId: dtIds[1].id, roleId: roleIds[0].id, tenantId: tenantIds[0].id, platformId: platformIds[1].id, siteId: siteIds[1].id, rackId: rackIds[3].id, position: "1", face: "front", serial: "N9336C-LON01", assetTag: "INV-2024-0300", description: "London core switch" },
  ]).$returningId();

  // Seed RIRs
  const rirIds = await db.insert(schema.rirs).values([
    { name: "ARIN", slug: "arin", isPrivate: false, description: "American Registry for Internet Numbers" },
    { name: "RIPE NCC", slug: "ripe-ncc", isPrivate: false, description: "RIPE Network Coordination Centre" },
    { name: "APNIC", slug: "apnic", isPrivate: false, description: "Asia-Pacific Network Information Centre" },
    { name: "RFC 1918", slug: "rfc1918", isPrivate: true, description: "Private address space" },
  ]).$returningId();

  // Seed VRFs
  const vrfIds = await db.insert(schema.vrfs).values([
    { name: "Default", rd: "65000:1", description: "Default VRF", tenantId: tenantIds[0].id },
    { name: "Customer-A", rd: "65000:100", description: "Customer A VRF", tenantId: tenantIds[3].id },
    { name: "Management", rd: "65000:999", description: "Management network VRF", tenantId: tenantIds[0].id },
  ]).$returningId();

  // Seed Prefixes
  const prefixIds = await db.insert(schema.prefixes).values([
    { prefix: "10.0.0.0/8", status: "container", description: "Corporate IP space" },
    { prefix: "10.0.0.0/16", status: "container", vrfId: vrfIds[0].id, tenantId: tenantIds[0].id, description: "NYC datacenter" },
    { prefix: "10.0.1.0/24", status: "active", vrfId: vrfIds[0].id, tenantId: tenantIds[0].id, description: "Core network" },
    { prefix: "10.0.2.0/24", status: "active", vrfId: vrfIds[0].id, tenantId: tenantIds[2].id, description: "App servers" },
    { prefix: "10.0.3.0/24", status: "reserved", vrfId: vrfIds[0].id, tenantId: tenantIds[1].id, description: "Security zone" },
    { prefix: "172.16.0.0/16", status: "container", description: "Management network" },
    { prefix: "172.16.1.0/24", status: "active", vrfId: vrfIds[2].id, tenantId: tenantIds[0].id, description: "OOB management" },
    { prefix: "192.168.0.0/16", status: "container", vrfId: vrfIds[1].id, tenantId: tenantIds[3].id, description: "Customer A space" },
    { prefix: "192.168.1.0/24", status: "active", vrfId: vrfIds[1].id, tenantId: tenantIds[3].id, description: "Customer A production" },
  ]).$returningId();

  // Seed IP Addresses
  await db.insert(schema.ipAddresses).values([
    { address: "10.0.1.1/24", status: "active", vrfId: vrfIds[0].id, dnsName: "edge-fw-01.corp.local", description: "Firewall inside" },
    { address: "10.0.1.10/24", status: "active", vrfId: vrfIds[0].id, dnsName: "core-sw-01.corp.local", description: "Core switch mgmt" },
    { address: "10.0.1.11/24", status: "active", vrfId: vrfIds[0].id, dnsName: "core-sw-02.corp.local", description: "Core switch mgmt" },
    { address: "10.0.1.20/24", status: "active", vrfId: vrfIds[0].id, dnsName: "dist-sw-01.corp.local", description: "Dist switch mgmt" },
    { address: "10.0.1.50/24", status: "active", vrfId: vrfIds[0].id, dnsName: "app-srv-01.corp.local", description: "App server" },
    { address: "10.0.1.51/24", status: "active", vrfId: vrfIds[0].id, dnsName: "app-srv-02.corp.local", description: "App server" },
    { address: "10.0.1.100/24", status: "reserved", vrfId: vrfIds[0].id, description: "Reserved for VIP" },
    { address: "172.16.1.10/24", status: "active", vrfId: vrfIds[2].id, description: "OOB core-sw-01" },
    { address: "172.16.1.11/24", status: "active", vrfId: vrfIds[2].id, description: "OOB core-sw-02" },
    { address: "192.168.1.1/24", status: "active", vrfId: vrfIds[1].id, description: "Customer A gateway" },
  ]);

  // Seed VLANs
  await db.insert(schema.vlans).values([
    { vid: 10, name: "CORP-PROD", status: "active", tenantId: tenantIds[0].id, description: "Corporate production" },
    { vid: 20, name: "CORP-DEV", status: "active", tenantId: tenantIds[2].id, description: "Corporate development" },
    { vid: 30, name: "SECURITY", status: "active", tenantId: tenantIds[1].id, description: "Security zone" },
    { vid: 99, name: "MGMT", status: "active", tenantId: tenantIds[0].id, description: "Management network" },
    { vid: 100, name: "CUST-A-PROD", status: "active", tenantId: tenantIds[3].id, description: "Customer A production" },
  ]);

  // Seed Providers
  const providerIds = await db.insert(schema.providers).values([
    { name: "AT&amp;T", slug: "att", description: "AT&amp;T Business" },
    { name: "Verizon", slug: "verizon", description: "Verizon Business" },
    { name: "Level 3", slug: "level3", description: "Lumen Technologies" },
    { name: "Equinix", slug: "equinix", description: "Equinix" },
  ]).$returningId();

  // Seed Circuit Types
  const ctIds = await db.insert(schema.circuitTypes).values([
    { name: "Internet Access", slug: "internet-access", color: "#3B82F6" },
    { name: "MPLS", slug: "mpls", color: "#10B981" },
    { name: "Dark Fiber", slug: "dark-fiber", color: "#8B5CF6" },
    { name: "Cross Connect", slug: "cross-connect", color: "#F59E0B" },
  ]).$returningId();

  // Seed Circuits
  await db.insert(schema.circuits).values([
    { cid: "ATT-123456789", providerId: providerIds[0].id, typeId: ctIds[0].id, status: "active", tenantId: tenantIds[0].id, commitRate: 1000000, description: "Primary Internet - 1Gbps" },
    { cid: "VZ-MPLS-001", providerId: providerIds[1].id, typeId: ctIds[1].id, status: "active", tenantId: tenantIds[0].id, commitRate: 500000, description: "MPLS WAN - 500Mbps" },
    { cid: "L3-DF-NYC-LON", providerId: providerIds[2].id, typeId: ctIds[2].id, status: "active", tenantId: tenantIds[0].id, commitRate: 10000000, description: "Dark Fiber NYC-London - 10Gbps" },
    { cid: "EQ-CC-1234", providerId: providerIds[3].id, typeId: ctIds[3].id, status: "active", tenantId: tenantIds[3].id, description: "Cross connect to Customer A cage" },
  ]);

  // Seed Cluster Types
  const clusterTypeIds = await db.insert(schema.clusterTypes).values([
    { name: "VMware vSphere", slug: "vmware-vsphere", description: "VMware vSphere cluster" },
    { name: "Kubernetes", slug: "kubernetes", description: "Kubernetes cluster" },
    { name: "Proxmox", slug: "proxmox", description: "Proxmox VE cluster" },
  ]).$returningId();

  // Seed Clusters
  const clusterIds = await db.insert(schema.clusters).values([
    { name: "NYC-Compute-01", typeId: clusterTypeIds[0].id, status: "active", siteId: siteIds[0].id, tenantId: tenantIds[0].id, description: "Primary compute cluster" },
    { name: "NYC-K8s-01", typeId: clusterTypeIds[1].id, status: "active", siteId: siteIds[0].id, tenantId: tenantIds[2].id, description: "Kubernetes production cluster" },
  ]).$returningId();

  // Seed Virtual Machines
  await db.insert(schema.virtualMachines).values([
    { name: "web-proxy-01", status: "active", clusterId: clusterIds[0].id, siteId: siteIds[0].id, tenantId: tenantIds[0].id, roleId: roleIds[5].id, vcpus: "4", memory: 16384, disk: 200, description: "Web proxy VM" },
    { name: "dns-01", status: "active", clusterId: clusterIds[0].id, siteId: siteIds[0].id, tenantId: tenantIds[0].id, roleId: roleIds[5].id, vcpus: "2", memory: 8192, disk: 100, description: "DNS server" },
    { name: "monitoring-01", status: "active", clusterId: clusterIds[0].id, siteId: siteIds[0].id, tenantId: tenantIds[0].id, roleId: roleIds[5].id, vcpus: "8", memory: 32768, disk: 500, description: "Monitoring stack" },
    { name: "k8s-master-01", status: "active", clusterId: clusterIds[1].id, siteId: siteIds[0].id, tenantId: tenantIds[2].id, roleId: roleIds[5].id, vcpus: "4", memory: 16384, disk: 100, description: "K8s master node" },
    { name: "k8s-worker-01", status: "active", clusterId: clusterIds[1].id, siteId: siteIds[0].id, tenantId: tenantIds[2].id, roleId: roleIds[5].id, vcpus: "16", memory: 65536, disk: 500, description: "K8s worker node" },
  ]);

  // Seed Tags
  const tagIds = await db.insert(schema.tags).values([
    { name: "production", slug: "production", color: "#10B981", description: "Production environment" },
    { name: "critical", slug: "critical", color: "#EF4444", description: "Critical infrastructure" },
    { name: "nyc", slug: "nyc", color: "#3B82F6", description: "NYC datacenter" },
    { name: "staging", slug: "staging", color: "#F59E0B", description: "Staging environment" },
    { name: "backup", slug: "backup", color: "#8B5CF6", description: "Backup system" },
  ]).$returningId();

  // Seed Custom Fields
  await db.insert(schema.customFields).values([
    { name: "support_contract", label: "Support Contract", objectTypes: JSON.stringify(["devices", "device_types"]), type: "text", required: false, weight: 100 },
    { name: "warranty_date", label: "Warranty Expires", objectTypes: JSON.stringify(["devices"]), type: "date", required: false, weight: 101 },
    { name: "cost_center", label: "Cost Center", objectTypes: JSON.stringify(["devices", "racks", "circuits"]), type: "integer", required: false, weight: 102 },
    { name: "environment", label: "Environment", objectTypes: JSON.stringify(["devices", "virtual_machines"]), type: "select", required: true, choices: JSON.stringify(["production", "staging", "development", "lab"]), weight: 103 },
  ]);

  // Seed Custom Modules
  const cmIds = await db.insert(schema.customModules).values([
    { name: "Software License", pluralName: "Software Licenses", slug: "software-licenses", icon: "key", color: "#F59E0B", description: "Track software licenses and subscriptions" },
    { name: "Vendor Contract", pluralName: "Vendor Contracts", slug: "vendor-contracts", icon: "file-text", color: "#10B981", description: "Manage vendor contracts and agreements" },
  ]).$returningId();

  // Seed Custom Module Fields
  await db.insert(schema.customModuleFields).values([
    { moduleId: cmIds[0].id, name: "license_key", label: "License Key", type: "text", required: true, order: 0 },
    { moduleId: cmIds[0].id, name: "product_name", label: "Product Name", type: "text", required: true, order: 1 },
    { moduleId: cmIds[0].id, name: "seats", label: "Number of Seats", type: "integer", required: false, order: 2 },
    { moduleId: cmIds[0].id, name: "expiry_date", label: "Expiry Date", type: "date", required: false, order: 3 },
    { moduleId: cmIds[1].id, name: "contract_number", label: "Contract Number", type: "text", required: true, order: 0 },
    { moduleId: cmIds[1].id, name: "vendor_name", label: "Vendor Name", type: "text", required: true, order: 1 },
    { moduleId: cmIds[1].id, name: "value", label: "Contract Value", type: "decimal", required: false, order: 2 },
    { moduleId: cmIds[1].id, name: "start_date", label: "Start Date", type: "date", required: true, order: 3 },
    { moduleId: cmIds[1].id, name: "end_date", label: "End Date", type: "date", required: true, order: 4 },
  ]);

  // Seed Custom Entities
  await db.insert(schema.customEntities).values([
    { moduleId: cmIds[0].id, data: JSON.stringify({ license_key: "XXXX-YYYY-ZZZZ-AAAA", product_name: "VMware vSphere 8", seats: 32, expiry_date: "2025-12-31" }), status: "active" },
    { moduleId: cmIds[0].id, data: JSON.stringify({ license_key: "ABCD-EFGH-IJKL-MNOP", product_name: "Palo Alto PAN-OS", seats: 2, expiry_date: "2025-06-30" }), status: "active" },
    { moduleId: cmIds[1].id, data: JSON.stringify({ contract_number: "CTR-2024-001", vendor_name: "Cisco Systems", value: "250000", start_date: "2024-01-01", end_date: "2026-12-31" }), status: "active" },
    { moduleId: cmIds[1].id, data: JSON.stringify({ contract_number: "CTR-2024-002", vendor_name: "Equinix", value: "180000", start_date: "2024-01-01", end_date: "2025-12-31" }), status: "active" },
  ]);

  // Seed Object Changes
  await db.insert(schema.objectChanges).values([
    { userName: "admin", action: "create", changedObjectType: "devices", changedObjectId: deviceIds[0].id, objectRepr: "core-sw-01", postchangeData: JSON.stringify({ name: "core-sw-01", status: "active" }) },
    { userName: "admin", action: "create", changedObjectType: "devices", changedObjectId: deviceIds[2].id, objectRepr: "edge-fw-01", postchangeData: JSON.stringify({ name: "edge-fw-01", status: "active" }) },
    { userName: "jdoe", action: "update", changedObjectType: "ip_addresses", changedObjectId: 5, objectRepr: "10.0.1.50/24", prechangeData: JSON.stringify({ status: "reserved" }), postchangeData: JSON.stringify({ status: "active", dns_name: "app-srv-01.corp.local" }) },
    { userName: "admin", action: "create", changedObjectType: "prefixes", changedObjectId: prefixIds[2].id, objectRepr: "10.0.1.0/24", postchangeData: JSON.stringify({ prefix: "10.0.1.0/24", status: "active" }) },
  ]);

  console.log("Seed complete!");
}

seed().catch(console.error);
