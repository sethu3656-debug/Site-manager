import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import { z } from "zod";
import { eq, count, desc } from "drizzle-orm";

export const customEntityRouter = createRouter({
  list: publicQuery.input(z.object({ moduleId: z.number(), page: z.number().default(1), pageSize: z.number().default(25) }).optional()).query(async ({ input }) => {
    const db = getDb();
    const page = input?.page || 1;
    const pageSize = input?.pageSize || 25;
    const offset = (page - 1) * pageSize;
    let query = db.select().from(schema.customEntities).where(eq(schema.customEntities.moduleId, input!.moduleId)).orderBy(desc(schema.customEntities.createdAt)) as any;
    const items = await query.limit(pageSize).offset(offset);
    const totalResult = await db.select({ value: count() }).from(schema.customEntities).where(eq(schema.customEntities.moduleId, input!.moduleId));
    return { items, total: totalResult[0]?.value || 0, page, pageSize };
  }),
  getById: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const result = await getDb().select().from(schema.customEntities).where(eq(schema.customEntities.id, input.id)).limit(1);
    return result[0] || null;
  }),
  create: publicQuery.input(z.object({ moduleId: z.number(), data: z.any(), tenantId: z.number().optional(), status: z.string().optional() })).mutation(async ({ input }) => {
    const result = await getDb().insert(schema.customEntities).values({ moduleId: input.moduleId, data: input.data, tenantId: input.tenantId, status: (input.status || "active") as any } as any).$returningId();
    return getDb().select().from(schema.customEntities).where(eq(schema.customEntities.id, result[0].id)).limit(1).then(r => r[0]);
  }),
  update: publicQuery.input(z.object({ id: z.number(), data: z.any(), status: z.string().optional() })).mutation(async ({ input }) => {
    const updateData: any = { data: input.data };
    if (input.status) updateData.status = input.status;
    await getDb().update(schema.customEntities).set(updateData).where(eq(schema.customEntities.id, input.id));
    return getDb().select().from(schema.customEntities).where(eq(schema.customEntities.id, input.id)).limit(1).then(r => r[0]);
  }),
  delete: publicQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await getDb().delete(schema.customEntities).where(eq(schema.customEntities.id, input.id));
    return { success: true };
  }),
});
