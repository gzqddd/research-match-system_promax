import { eq, and, gte, lte, desc } from "drizzle-orm";
import { systemStats, type InsertSystemStats } from "../../drizzle/schema";
import { getDb } from "./database";

export async function createSystemStats(stats: InsertSystemStats) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(systemStats).values(stats);
  return result;
}

export async function getSystemStatsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(systemStats)
    .where(and(gte(systemStats.date, startDate), lte(systemStats.date, endDate)))
    .orderBy(desc(systemStats.date));
}

export async function getLatestSystemStats() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(systemStats).orderBy(desc(systemStats.date)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

