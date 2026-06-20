import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import { z } from "zod";
import { eq, count, sql } from "drizzle-orm";

export const tagRouter = createRouter({
  list: publicQuery.input(z.object({ page: z.number().default(1), pageSize: z.number().default(25), search: z.string().optional() }).optional()).query(async ({ input }) => {
    const db = getDb();
    const page = input?.page || 1;
    const pageSize = input?.pageSize || 25;
    const offset = (page - 1) * pageSize;
    let query = db.select().from(schema.tags).orderBy(schema.tags.name) as any;
    if (input?.search) query = query.where(sql`${schema.tags.name} LIKE ${`%${input.search}%`}`);
    const items = await query.limit(pageSize).offset(offset);
    const totalResult = await db.select({ value: count() }).from(schema.tags);
    return { items, total: totalResult[0]?.value || 0, page, pageSize };
  }),
  getById: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const result = await getDb().select().from(schema.tags).where(eq(schema.tags.id, input.id)).limit(1);
    return result[0] || null;
  }),
  create: publicQuery.input(z.object({ name: z.string(), slug: z.string(), color: z.string().optional(), description: z.string().optional() })).mutation(async ({ input }) => {
    const result = await getDb().insert(schema.tags).values(input).$returningId();
    return getDb().select().from(schema.tags).where(eq(schema.tags.id, result[0].id)).limit(1).then(r => r[0]);
  }),
  delete: publicQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await getDb().delete(schema.tags).where(eq(schema.tags.id, input.id));
    return { success: true };
  }),
});
