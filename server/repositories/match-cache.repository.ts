import { eq, and, gte, lte } from "drizzle-orm";
import { matchCache, type InsertMatchCache } from "../../drizzle/schema";
import { getDb } from "./database";

export async function createMatchCache(cache: InsertMatchCache) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(matchCache).values(cache);
  return result;
}

export async function getMatchCache(studentId: number, projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const now = new Date();
  const result = await db
    .select()
    .from(matchCache)
    .where(and(eq(matchCache.studentId, studentId), eq(matchCache.projectId, projectId), gte(matchCache.expiresAt, now)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function cleanExpiredMatchCache() {
  const db = await getDb();
  if (!db) return;
  const now = new Date();
  await db.delete(matchCache).where(lte(matchCache.expiresAt, now));
}

