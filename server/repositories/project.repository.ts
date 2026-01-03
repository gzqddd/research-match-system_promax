import { eq, desc, sql, inArray } from "drizzle-orm";
import { projects, type InsertProject, type Project } from "../../drizzle/schema";
import { getDb } from "./database";

export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(project);
  return result;
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProjectsByTeacherId(teacherId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(projects).where(eq(projects.teacherId, teacherId)).orderBy(desc(projects.createdAt));
}

export async function getAllPublishedProjects() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(projects).where(eq(projects.status, "published")).orderBy(desc(projects.createdAt));
}

export async function updateProject(id: number, updates: Partial<Project>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set(updates).where(eq(projects.id, id));
}

export async function incrementProjectViewCount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(projects).set({ viewCount: sql`${projects.viewCount} + 1` }).where(eq(projects.id, id));
}

export async function getAllProjects(status?: Project["status"][]) {
  const db = await getDb();
  if (!db) return [];
  if (status && status.length > 0) {
    return await db.select().from(projects).where(inArray(projects.status, status)).orderBy(desc(projects.createdAt));
  }
  return await db.select().from(projects).orderBy(desc(projects.createdAt));
}

