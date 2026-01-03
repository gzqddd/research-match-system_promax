import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { teacherProcedure, publicProcedure, router } from "./middleware";
import * as db from "../repositories";

export const teacherRouter = router({
  profile: router({
    get: teacherProcedure.query(async ({ ctx }) => {
      return await db.getTeacherProfileByUserId(ctx.user.id);
    }),
    getById: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input }) => {
      return await db.getTeacherProfileByUserId(input.userId);
    }),
    create: teacherProcedure
      .input(
        z.object({
          employeeId: z.string().optional(),
          title: z.string().optional(),
          department: z.string().optional(),
          researchDirection: z.string().optional(),
          achievements: z.string().optional(),
          avatarUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createTeacherProfile({
          userId: ctx.user.id,
          ...input,
        });
      }),
    update: teacherProcedure
      .input(
        z.object({
          employeeId: z.string().optional(),
          title: z.string().optional(),
          department: z.string().optional(),
          researchDirection: z.string().optional(),
          achievements: z.string().optional(),
          avatarUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.updateTeacherProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),
  projects: router({
    myProjects: teacherProcedure.query(async ({ ctx }) => {
      return await db.getProjectsByTeacherId(ctx.user.id);
    }),
    create: teacherProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          department: z.string().optional(),
          researchField: z.string().optional(),
          requirements: z.string().optional(),
          requiredSkills: z.string().optional(),
          duration: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          recruitCount: z.number().optional(),
          status: z.enum(["draft", "published", "closed"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createProject({
          teacherId: ctx.user.id,
          ...input,
        });
      }),
    update: teacherProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          department: z.string().optional(),
          researchField: z.string().optional(),
          requirements: z.string().optional(),
          requiredSkills: z.string().optional(),
          duration: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          recruitCount: z.number().optional(),
          status: z.enum(["draft", "published", "closed"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        const project = await db.getProjectById(id);
        if (!project || project.teacherId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "无权修改此项目" });
        }
        await db.updateProject(id, updates);
        return { success: true };
      }),
  }),
  applications: router({
    list: teacherProcedure
      .input(
        z.object({
          status: z.array(
            z.enum(["submitted", "screening_passed", "interview_scheduled", "accepted", "rejected"])
          ).optional(),
          projectId: z.number().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        // 返回 application + studentProfile，供前端展示学生简历等信息
        return await db.getApplicationsByTeacher(ctx.user.id, {
          status: input.status,
          projectId: input.projectId,
        });
      }),
    projectApplications: teacherProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.teacherId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "无权查看此项目的申请" });
        }
        // 返回 application + studentProfile
        return await db.getApplicationsByProjectId(input.projectId);
      }),
    updateStatus: teacherProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["submitted", "screening_passed", "interview_scheduled", "accepted", "rejected"]),
          teacherFeedback: z.string().optional(),
          interviewTime: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        const application = await db.getApplicationById(id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "申请不存在" });
        }
        const project = await db.getProjectById(application.projectId);
        if (!project || project.teacherId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "无权操作此申请" });
        }
        await db.updateApplication(id, updates);
        return { success: true };
      }),
  }),
  internships: router({
    list: teacherProcedure.query(async ({ ctx }) => {
      return await db.getInternshipsByTeacherId(ctx.user.id);
    }),
    create: teacherProcedure
      .input(
        z.object({
          applicationId: z.number(),
          stage: z.enum([
            "literature_review",
            "code_reproduction",
            "experiment_improvement",
            "completed",
            "onboarding",
            "ongoing",
            "paused",
          ]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const application = await db.getApplicationById(input.applicationId);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "申请不存在" });
        }
        return await db.createInternshipProgress(input);
      }),
    updateStage: teacherProcedure
      .input(
        z.object({
          applicationId: z.number(),
          stage: z.enum([
            "literature_review",
            "code_reproduction",
            "experiment_improvement",
            "completed",
            "onboarding",
            "ongoing",
            "paused",
          ]),
          weeklyReports: z.string().optional(),
          stageEvaluations: z.string().optional(),
          finalScore: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { applicationId, ...updates } = input;
        await db.updateInternshipProgress(applicationId, updates);
        return { success: true };
      }),
  }),
});

