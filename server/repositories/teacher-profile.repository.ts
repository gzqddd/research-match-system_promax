import { eq } from "drizzle-orm";
import { teacherProfiles, type InsertTeacherProfile, type TeacherProfile } from "../../drizzle/schema";
import { getDb } from "./database";

export async function createTeacherProfile(profile: InsertTeacherProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(teacherProfiles).values(profile);
  return result;
}

export async function getTeacherProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTeacherProfile(userId: number, updates: Partial<TeacherProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(teacherProfiles).set(updates).where(eq(teacherProfiles.userId, userId));
}

export async function getAllTeacherProfiles() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(teacherProfiles);
}

