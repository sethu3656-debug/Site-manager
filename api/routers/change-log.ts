import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import { z } from "zod";
import { eq, count, desc, sql } from "drizzle-orm";

export const changeLogRouter = createRouter({
  list: publicQuery.input(z.object({ page: z.number().default(1), pageSize: z.number().default(25), objectType: z.string().optional(), objectId: z.number().optional() }).optional()).query(async ({ input }) => {
    const db = getDb();
    const page = input?.page || 1;
    const pageSize = input?.pageSize || 25;
    const offset = (page - 1) * pageSize;
    let conditions = [];
    if (input?.objectType) conditions.push(eq(schema.objectChanges.changedObjectType, input.objectType));
    if (input?.objectId) conditions.push(eq(schema.objectChanges.changedObjectId, input.objectId));
    const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;
    const items = await db.select().from(schema.objectChanges).where(where).orderBy(desc(schema.objectChanges.createdAt)).limit(pageSize).offset(offset);
    const totalResult = await db.select({ value: count() }).from(schema.objectChanges).where(where);
    return { items, total: totalResult[0]?.value || 0, page, pageSize };
  }),
  create: publicQuery.input(z.record(z.string(), z.any())).mutation(async ({ input }) => {
    const result = await getDb().insert(schema.objectChanges).values(input as any).$returningId();
    return getDb().select().from(schema.objectChanges).where(eq(schema.objectChanges.id, result[0].id)).limit(1).then(r => r[0]);
  }),
});
