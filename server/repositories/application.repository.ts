import { eq, and, desc, inArray } from "drizzle-orm";
import {
  applications,
  projects,
  studentProfiles,
  users,
  type InsertApplication,
  type Application,
} from "../../drizzle/schema";
import { getDb } from "./database";

export async function createApplication(application: InsertApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(applications).values(application);
  return result;
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getApplicationsByStudentId(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(applications).where(eq(applications.studentId, studentId)).orderBy(desc(applications.createdAt));
}

export async function getApplicationsByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      application: applications,
      studentProfile: studentProfiles,
      user: users,
    })
    .from(applications)
    .leftJoin(users, eq(users.id, applications.studentId))
    .leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
    .where(eq(applications.projectId, projectId))
    .orderBy(desc(applications.matchScore));

  return rows;
}

export async function getApplicationsByTeacher(
  teacherId: number,
  filters?: { status?: Application["status"][]; projectId?: number }
) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(projects.teacherId, teacherId)];
  if (filters?.projectId) {
    conditions.push(eq(applications.projectId, filters.projectId));
  }
  if (filters?.status && filters.status.length > 0) {
    conditions.push(inArray(applications.status, filters.status));
  }

  const rows = await db
    .select({
      application: applications,
      studentProfile: studentProfiles,
      user: users,
    })
    .from(applications)
    .innerJoin(projects, eq(applications.projectId, projects.id))
    .leftJoin(users, eq(users.id, applications.studentId))
    .leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(applications.createdAt));

  return rows;
}

export async function updateApplication(id: number, updates: Partial<Application>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(applications).set(updates).where(eq(applications.id, id));
}

export async function checkExistingApplication(studentId: number, projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(applications)
    .where(and(eq(applications.studentId, studentId), eq(applications.projectId, projectId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

