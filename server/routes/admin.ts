import { z } from "zod";
import { adminProcedure, router } from "./middleware";
import * as db from "../repositories";

export const adminRouter = router({
  users: adminProcedure.input(z.object({ role: z.enum(["student", "teacher", "admin"]).optional() })).query(async ({ input }) => {
    return await db.getAllUsers(input.role);
  }),
  projects: adminProcedure
    .input(
      z.object({
        status: z.array(z.enum(["draft", "pending_review", "published", "rejected", "closed"])).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await db.getAllProjects(input?.status);
    }),
  updateUser: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["student", "teacher", "admin"]).optional(),
        status: z.enum(["active", "pending", "banned"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, ...updates } = input;
      await db.updateUserCore(userId, updates);
      return { success: true };
    }),
  stats: adminProcedure.query(async () => {
    const stats = await db.getLatestSystemStats();
    return stats ?? null;
  }),
  statsHistory: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      return await db.getSystemStatsByDateRange(input.startDate, input.endDate);
    }),
  reviewProject: adminProcedure
    .input(
      z.object({
        projectId: z.number(),
        status: z.enum(["draft", "pending_review", "published", "rejected", "closed"]),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateProject(input.projectId, { status: input.status });
      return { success: true };
    }),
});

