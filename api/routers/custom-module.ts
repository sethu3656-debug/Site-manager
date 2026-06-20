import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import { z } from "zod";
import { eq, count, desc } from "drizzle-orm";

export const customModuleRouter = createRouter({
  list: publicQuery.input(z.object({ page: z.number().default(1), pageSize: z.number().default(25) }).optional()).query(async ({ input }) => {
    const db = getDb();
    const page = input?.page || 1;
    const pageSize = input?.pageSize || 25;
    const offset = (page - 1) * pageSize;
    const items = await db.select().from(schema.customModules).where(eq(schema.customModules.isActive, true)).orderBy(desc(schema.customModules.createdAt)).limit(pageSize).offset(offset);
    const totalResult = await db.select({ value: count() }).from(schema.customModules).where(eq(schema.customModules.isActive, true));
    return { items, total: totalResult[0]?.value || 0, page, pageSize };
  }),
  getById: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const moduleResult = await db.select().from(schema.customModules).where(eq(schema.customModules.id, input.id)).limit(1);
    if (!moduleResult[0]) return null;
    const fields = await db.select().from(schema.customModuleFields).where(eq(schema.customModuleFields.moduleId, input.id)).orderBy(schema.customModuleFields.order);
    return { ...moduleResult[0], fields };
  }),
  create: publicQuery.input(z.record(z.string(), z.any())).mutation(async ({ input }) => {
    const result = await getDb().insert(schema.customModules).values(input as any).$returningId();
    return getDb().select().from(schema.customModules).where(eq(schema.customModules.id, result[0].id)).limit(1).then(r => r[0]);
  }),
  update: publicQuery.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
    await getDb().update(schema.customModules).set(input.data as any).where(eq(schema.customModules.id, input.id));
    return getDb().select().from(schema.customModules).where(eq(schema.customModules.id, input.id)).limit(1).then(r => r[0]);
  }),
  delete: publicQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await getDb().update(schema.customModules).set({ isActive: false }).where(eq(schema.customModules.id, input.id));
    return { success: true };
  }),
  addField: publicQuery.input(z.record(z.string(), z.any())).mutation(async ({ input }) => {
    const { moduleId, ...fieldData } = input;
    const result = await getDb().insert(schema.customModuleFields).values({ moduleId, ...fieldData } as any).$returningId();
    return getDb().select().from(schema.customModuleFields).where(eq(schema.customModuleFields.id, result[0].id)).limit(1).then(r => r[0]);
  }),
});
