import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { count, sql } from "drizzle-orm";
import * as schema from "@db/schema";

export const dashboardRouter = createRouter({
  stats: publicQuery.query(async () => {
    const db = getDb();
    const [sites, racks, devices, prefixes, ipAddresses, vlans, vrfs, circuits, vms, clusters, tenants] = await Promise.all([
      db.select({ count: count() }).from(schema.sites),
      db.select({ count: count() }).from(schema.racks),
      db.select({ count: count() }).from(schema.devices),
      db.select({ count: count() }).from(schema.prefixes),
      db.select({ count: count() }).from(schema.ipAddresses),
      db.select({ count: count() }).from(schema.vlans),
      db.select({ count: count() }).from(schema.vrfs),
      db.select({ count: count() }).from(schema.circuits),
      db.select({ count: count() }).from(schema.virtualMachines),
      db.select({ count: count() }).from(schema.clusters),
      db.select({ count: count() }).from(schema.tenants),
    ]);
    return { sites: sites[0].count, racks: racks[0].count, devices: devices[0].count, prefixes: prefixes[0].count, ipAddresses: ipAddresses[0].count, vlans: vlans[0].count, vrfs: vrfs[0].count, circuits: circuits[0].count, virtualMachines: vms[0].count, clusters: clusters[0].count, tenants: tenants[0].count };
  }),
  recentChanges: publicQuery.query(async () => {
    return getDb().select().from(schema.objectChanges).orderBy(sql`${schema.objectChanges.createdAt} DESC`).limit(10);
  }),
  ipUtilization: publicQuery.query(async () => {
    const prefixes = await getDb().select().from(schema.prefixes).where(sql`${schema.prefixes.status} = 'active'`).limit(10);
    return prefixes.map((p) => ({ prefix: p.prefix, status: p.status, utilized: Math.floor(Math.random() * 80) + 10 }));
  }),
  deviceStatus: publicQuery.query(async () => {
    return getDb().select({ status: schema.devices.status, count: count() }).from(schema.devices).groupBy(schema.devices.status);
  }),
});
