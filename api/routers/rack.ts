import { createRouter, publicQuery } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { z } from "zod";

const base = createCrudRouter(schema.racks, "rack", ["name"]);

export const rackRouter = createRouter({
  list: base.list,
  getById: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const rack = await db.select().from(schema.racks).where(eq(schema.racks.id, input.id)).limit(1);
    if (!rack[0]) return null;
    const [site, devices] = await Promise.all([
      db.select().from(schema.sites).where(eq(schema.sites.id, rack[0].siteId)).limit(1),
      db.select().from(schema.devices).where(eq(schema.devices.rackId, rack[0].id)),
    ]);
    
    // Enrich devices with their role and device type (for elevation labels)
    const enrichedDevices = await Promise.all(devices.map(async (d) => {
      const [role, type] = await Promise.all([
        db.select().from(schema.deviceRoles).where(eq(schema.deviceRoles.id, d.roleId)).limit(1),
        db.select().from(schema.deviceTypes).where(eq(schema.deviceTypes.id, d.deviceTypeId)).limit(1),
      ]);
      return {
        ...d,
        role: role[0] || null,
        deviceType: type[0] || null,
      };
    }));

    return {
      ...rack[0],
      site: site[0] || null,
      devices: enrichedDevices,
    };
  }),
  create: base.create,
  update: base.update,
  delete: base.delete,
});
