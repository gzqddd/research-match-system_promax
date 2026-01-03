import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { studentProcedure, router } from "./middleware";
import * as db from "../repositories";

export const applicationRouter = router({
  myApplications: studentProcedure.query(async ({ ctx }) => {
    return await db.getApplicationsByStudentId(ctx.user.id);
  }),
  create: studentProcedure
    .input(
      z.object({
        projectId: z.number(),
        statement: z.string(),
        matchScore: z.number().optional(),
        matchAnalysis: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db.checkExistingApplication(ctx.user.id, input.projectId);
      if (existing) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "您已申请过此项目" });
      }
      return await db.createApplication({
        studentId: ctx.user.id,
        ...input,
      });
    }),
  getMyById: studentProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const application = await db.getApplicationById(input.id);
      if (!application || application.studentId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权查看此申请" });
      }
      const project = await db.getProjectById(application.projectId);
      return {
        application,
        project: project ?? null,
      };
    }),
});

