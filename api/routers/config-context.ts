import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import { z } from "zod";
import { eq, count, desc } from "drizzle-orm";

export const configContextRouter = createRouter({
  list: publicQuery.input(z.object({ page: z.number().default(1), pageSize: z.number().default(25) }).optional()).query(async ({ input }) => {
    const db = getDb();
    const page = input?.page || 1;
    const pageSize = input?.pageSize || 25;
    const offset = (page - 1) * pageSize;
    const items = await db.select().from(schema.configContexts).orderBy(desc(schema.configContexts.createdAt)).limit(pageSize).offset(offset);
    const totalResult = await db.select({ value: count() }).from(schema.configContexts);
    return { items, total: totalResult[0]?.value || 0, page, pageSize };
  }),
  getById: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const result = await getDb().select().from(schema.configContexts).where(eq(schema.configContexts.id, input.id)).limit(1);
    return result[0] || null;
  }),
  create: publicQuery.input(z.record(z.string(), z.any())).mutation(async ({ input }) => {
    const result = await getDb().insert(schema.configContexts).values(input as any).$returningId();
    return getDb().select().from(schema.configContexts).where(eq(schema.configContexts.id, result[0].id)).limit(1).then(r => r[0]);
  }),
  update: publicQuery.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
    await getDb().update(schema.configContexts).set(input.data as any).where(eq(schema.configContexts.id, input.id));
    return getDb().select().from(schema.configContexts).where(eq(schema.configContexts.id, input.id)).limit(1).then(r => r[0]);
  }),
  delete: publicQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await getDb().delete(schema.configContexts).where(eq(schema.configContexts.id, input.id));
    return { success: true };
  }),
});
