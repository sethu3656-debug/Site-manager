import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import { z } from "zod";
import { eq, count, desc } from "drizzle-orm";

export const wirelessLanRouter = createRouter({
  list: publicQuery.input(z.object({ page: z.number().default(1), pageSize: z.number().default(25), search: z.string().optional() }).optional()).query(async ({ input }) => {
    const db = getDb();
    const page = input?.page || 1;
    const pageSize = input?.pageSize || 25;
    const offset = (page - 1) * pageSize;
    let query = db.select().from(schema.wirelessLans).orderBy(desc(schema.wirelessLans.createdAt)) as any;
    const items = await query.limit(pageSize).offset(offset);
    const totalResult = await db.select({ value: count() }).from(schema.wirelessLans);
    return { items, total: totalResult[0]?.value || 0, page, pageSize };
  }),
  getById: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const result = await getDb().select().from(schema.wirelessLans).where(eq(schema.wirelessLans.id, input.id)).limit(1);
    return result[0] || null;
  }),
  create: publicQuery.input(z.record(z.string(), z.any())).mutation(async ({ input }) => {
    const result = await getDb().insert(schema.wirelessLans).values(input as any).$returningId();
    return getDb().select().from(schema.wirelessLans).where(eq(schema.wirelessLans.id, result[0].id)).limit(1).then(r => r[0]);
  }),
  update: publicQuery.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
    await getDb().update(schema.wirelessLans).set(input.data as any).where(eq(schema.wirelessLans.id, input.id));
    return getDb().select().from(schema.wirelessLans).where(eq(schema.wirelessLans.id, input.id)).limit(1).then(r => r[0]);
  }),
  delete: publicQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await getDb().delete(schema.wirelessLans).where(eq(schema.wirelessLans.id, input.id));
    return { success: true };
  }),
});
