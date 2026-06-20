import { getDb } from "../api/queries/connection";
import * as schema from "./schema";
import { sql, ne } from "drizzle-orm";

async function clear() {
  const db = getDb();
  console.log("Clearing all database records...");

  // Disable foreign key constraints to prevent deletion block errors
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0;`);

  try {
    // Clear all tables
    await db.delete(schema.sessions);
    await db.delete(schema.userGroups);
    await db.delete(schema.tenantGroups);
    await db.delete(schema.tenants);
    await db.delete(schema.regions);
    await db.delete(schema.siteGroups);
    await db.delete(schema.sites);
    await db.delete(schema.locations);
    await db.delete(schema.rackRoles);
    await db.delete(schema.racks);
    await db.delete(schema.manufacturers);
    await db.delete(schema.platforms);
    await db.delete(schema.deviceRoles);
    await db.delete(schema.deviceTypes);
    await db.delete(schema.devices);
    await db.delete(schema.interfaces);
    await db.delete(schema.rirs);
    await db.delete(schema.aggregates);
    await db.delete(schema.roles);
    await db.delete(schema.vrfs);
    await db.delete(schema.prefixes);
    await db.delete(schema.ipAddresses);
    await db.delete(schema.ipRanges);
    await db.delete(schema.vlans);
    await db.delete(schema.vlanGroups);
    await db.delete(schema.asns);
    await db.delete(schema.services);
    await db.delete(schema.providers);
    await db.delete(schema.circuitTypes);
    await db.delete(schema.circuits);
    await db.delete(schema.clusterTypes);
    await db.delete(schema.clusterGroups);
    await db.delete(schema.clusters);
    await db.delete(schema.virtualMachines);
    await db.delete(schema.ikePolicies);
    await db.delete(schema.ipsecPolicies);
    await db.delete(schema.ipsecProfiles);
    await db.delete(schema.tunnelGroups);
    await db.delete(schema.tunnels);
    await db.delete(schema.l2vpns);
    await db.delete(schema.wirelessLanGroups);
    await db.delete(schema.wirelessLans);
    await db.delete(schema.contactGroups);
    await db.delete(schema.contactRoles);
    await db.delete(schema.contacts);
    await db.delete(schema.tags);
    await db.delete(schema.taggedItems);
    await db.delete(schema.customFields);
    await db.delete(schema.customModules);
    await db.delete(schema.customModuleFields);
    await db.delete(schema.customEntities);
    await db.delete(schema.journalEntries);
    await db.delete(schema.objectChanges);
    await db.delete(schema.configContexts);
    await db.delete(schema.cables);

    // Delete all users except for 'admin'
    await db.delete(schema.users).where(ne(schema.users.username, "admin"));

    console.log("Database cleared successfully (except admin user)!");
  } catch (error) {
    console.error("Error clearing database:", error);
  } finally {
    // Re-enable foreign key constraints
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1;`);
  }
}

clear().catch(console.error);
