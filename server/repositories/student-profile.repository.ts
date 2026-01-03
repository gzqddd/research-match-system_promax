import { eq } from "drizzle-orm";
import { studentProfiles, type InsertStudentProfile, type StudentProfile } from "../../drizzle/schema";
import { getDb } from "./database";

export async function createStudentProfile(profile: InsertStudentProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(studentProfiles).values(profile);
  return result;
}

export async function getStudentProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateStudentProfile(userId: number, updates: Partial<StudentProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(studentProfiles).set(updates).where(eq(studentProfiles.userId, userId));
}

export async function getAllStudentProfiles() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(studentProfiles);
}

