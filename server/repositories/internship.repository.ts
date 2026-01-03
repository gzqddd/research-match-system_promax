import { eq, desc } from "drizzle-orm";
import { internshipProgress, applications, projects, type InsertInternshipProgress, type InternshipProgress } from "../../drizzle/schema";
import { getDb } from "./database";

export async function createInternshipProgress(progress: InsertInternshipProgress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(internshipProgress).values(progress);
  return result;
}

export async function getInternshipProgressByApplicationId(applicationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(internshipProgress).where(eq(internshipProgress.applicationId, applicationId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getInternshipsByTeacherId(teacherId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ internship: internshipProgress })
    .from(internshipProgress)
    .innerJoin(applications, eq(internshipProgress.applicationId, applications.id))
    .innerJoin(projects, eq(applications.projectId, projects.id))
    .where(eq(projects.teacherId, teacherId))
    .orderBy(desc(internshipProgress.updatedAt));
  return rows.map((row) => row.internship);
}

export async function updateInternshipProgress(applicationId: number, updates: Partial<InternshipProgress>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(internshipProgress).set(updates).where(eq(internshipProgress.applicationId, applicationId));
}

