import { z } from "zod";
import { eq, like, and, desc, sql, count } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { MySqlTable } from "drizzle-orm/mysql-core";
import { authedQuery } from "../middleware";

export function createCrudRouter<T extends MySqlTable>(
  table: T,
  name: string,
  searchFields: (keyof T["_"]["columns"])[] = ["name" as any],
  extraInclude?: (db: any, items: any[]) => Promise<any[]>
) {
  const anyTable = table as any;
  const listInput = z.object({
    page: z.number().default(1),
    pageSize: z.number().default(25),
    search: z.string().optional(),
    sort: z.string().optional(),
    sortDir: z.enum(["asc", "desc"]).default("asc"),
    status: z.string().optional(),
    tenantId: z.number().optional(),
    siteId: z.number().optional(),
  });

  return {
    list: authedQuery.input(listInput).query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.pageSize;
      const conditions = [];

      if (input.search && searchFields.length > 0) {
        const searchCondition = searchFields.map((field) =>
          like(anyTable[field] as any, `%${input.search}%`)
        );
        conditions.push(sql`${sql.join(searchCondition, sql` OR `)}`);
      }
      if (input.status && "status" in anyTable) {
        conditions.push(eq(anyTable.status, input.status));
      }
      if (input.tenantId && "tenantId" in anyTable) {
        conditions.push(eq(anyTable.tenantId, input.tenantId));
      }
      if (input.siteId && "siteId" in anyTable) {
        conditions.push(eq(anyTable.siteId, input.siteId));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const totalResult = await db.select({ value: count() }).from(table).where(where);
      const total = totalResult[0]?.value || 0;

      let query = db.select().from(table).where(where) as any;
      if ("createdAt" in anyTable) {
        query = query.orderBy(desc(anyTable.createdAt));
      }
      query = query.limit(input.pageSize).offset(offset);
      const items = await query;

      let enrichedItems = items;
      if (extraInclude) {
        enrichedItems = await extraInclude(db, items);
      }

      return { items: enrichedItems, total, page: input.page, pageSize: input.pageSize };
    }),

    getById: authedQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(table).where(eq(anyTable.id as any, input.id)).limit(1);
      return result[0] || null;
    }),

    create: authedQuery.input(z.any()).mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const result = await db.insert(table).values(data as any).$returningId();
      const inserted = await db.select().from(table).where(eq(anyTable.id as any, (result[0] as any).id)).limit(1);
      return inserted[0];
    }),

    update: authedQuery.input(z.object({ id: z.number(), data: z.any() })).mutation(async ({ input }) => {
      const db = getDb();
      await db.update(table).set(input.data as any).where(eq(anyTable.id as any, input.id));
      const updated = await db.select().from(table).where(eq(anyTable.id as any, input.id)).limit(1);
      return updated[0];
    }),

    delete: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(table).where(eq(anyTable.id as any, input.id));
      return { success: true };
    }),
  };
}
