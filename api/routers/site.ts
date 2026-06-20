import { createRouter, publicQuery } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { z } from "zod";

const base = createCrudRouter(schema.sites, "site", ["name", "slug", "description"]);

export const siteRouter = createRouter({
  list: base.list,
  getById: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const site = await db.select().from(schema.sites).where(eq(schema.sites.id, input.id)).limit(1);
    if (!site[0]) return null;
    const [region, siteGroup, tenant, racks, devices] = await Promise.all([
      site[0].regionId ? db.select().from(schema.regions).where(eq(schema.regions.id, site[0].regionId)).limit(1) : Promise.resolve([]),
      site[0].siteGroupId ? db.select().from(schema.siteGroups).where(eq(schema.siteGroups.id, site[0].siteGroupId)).limit(1) : Promise.resolve([]),
      site[0].tenantId ? db.select().from(schema.tenants).where(eq(schema.tenants.id, site[0].tenantId)).limit(1) : Promise.resolve([]),
      db.select().from(schema.racks).where(eq(schema.racks.siteId, site[0].id)),
      db.select().from(schema.devices).where(eq(schema.devices.siteId, site[0].id)),
    ]);
    return {
      ...site[0],
      region: region[0] || null,
      siteGroup: siteGroup[0] || null,
      tenant: tenant[0] || null,
      racks,
      devices,
    };
  }),
  create: base.create,
  update: base.update,
  delete: base.delete,
});
