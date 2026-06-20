import { createRouter, publicQuery } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { z } from "zod";

const base = createCrudRouter(schema.devices, "devices", ["name", "serial", "assetTag", "description"]);

export const deviceRouter = createRouter({
  list: base.list,
  getById: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const device = await db.select().from(schema.devices).where(eq(schema.devices.id, input.id)).limit(1);
    if (!device[0]) return null;
    const [deviceType, role, site, tenant, platform, rack] = await Promise.all([
      db.select().from(schema.deviceTypes).where(eq(schema.deviceTypes.id, device[0].deviceTypeId)).limit(1),
      db.select().from(schema.deviceRoles).where(eq(schema.deviceRoles.id, device[0].roleId)).limit(1),
      db.select().from(schema.sites).where(eq(schema.sites.id, device[0].siteId)).limit(1),
      device[0].tenantId ? db.select().from(schema.tenants).where(eq(schema.tenants.id, device[0].tenantId)).limit(1) : Promise.resolve([]),
      device[0].platformId ? db.select().from(schema.platforms).where(eq(schema.platforms.id, device[0].platformId)).limit(1) : Promise.resolve([]),
      device[0].rackId ? db.select().from(schema.racks).where(eq(schema.racks.id, device[0].rackId)).limit(1) : Promise.resolve([]),
    ]);
    return { ...device[0], deviceType: deviceType[0] || null, role: role[0] || null, site: site[0] || null, tenant: tenant[0] || null, platform: platform[0] || null, rack: rack[0] || null };
  }),
  create: base.create,
  update: base.update,
  delete: base.delete,
  getInterfaces: publicQuery.input(z.object({ deviceId: z.number() })).query(async ({ input }) => {
    return getDb().select().from(schema.interfaces).where(eq(schema.interfaces.deviceId, input.deviceId));
  }),
});
