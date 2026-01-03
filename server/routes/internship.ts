import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, studentProcedure, teacherProcedure, router } from "./middleware";
import * as db from "../repositories";

export const internshipRouter = router({
  getProgress: protectedProcedure
    .input(z.object({ applicationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const application = await db.getApplicationById(input.applicationId);
      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "申请不存在" });
      }

      if (ctx.user.role === "student" && application.studentId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权查看此实习进度" });
      }

      if (ctx.user.role === "teacher") {
        const project = await db.getProjectById(application.projectId);
        if (!project || project.teacherId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "无权查看此实习进度" });
        }
      }

      const progress = await db.getInternshipProgressByApplicationId(input.applicationId);
      return progress ?? null;
    }),
  submitWeeklyReport: studentProcedure
    .input(
      z.object({
        applicationId: z.number(),
        content: z.string().min(1, "周报内容不能为空"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const application = await db.getApplicationById(input.applicationId);
      if (!application || application.studentId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权提交此申请的周报" });
      }

      let progress = await db.getInternshipProgressByApplicationId(input.applicationId);
      if (!progress) {
        await db.createInternshipProgress({
          applicationId: input.applicationId,
          stage: "onboarding",
          weeklyReports: JSON.stringify([]),
          stageEvaluations: null,
          finalScore: null,
        });
        progress = await db.getInternshipProgressByApplicationId(input.applicationId);
      }

      const now = new Date().toISOString();
      let reports: Array<{ createdAt: string; content: string }> = [];
      if (progress?.weeklyReports) {
        try {
          reports = JSON.parse(progress.weeklyReports) ?? [];
        } catch {
          reports = [];
        }
      }
      reports.push({ createdAt: now, content: input.content });

      await db.updateInternshipProgress(input.applicationId, {
        weeklyReports: JSON.stringify(reports),
      });

      return { success: true };
    }),
  addWeeklyFeedback: teacherProcedure
    .input(
      z.object({
        applicationId: z.number(),
        index: z.number().min(0),
        feedback: z.string().min(1, "反馈内容不能为空"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const application = await db.getApplicationById(input.applicationId);
      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "申请不存在" });
      }

      // 权限：必须是该申请对应项目的导师
      const project = await db.getProjectById(application.projectId);
      if (!project || project.teacherId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权为此周报添加反馈" });
      }

      const progress = await db.getInternshipProgressByApplicationId(input.applicationId);
      if (!progress || !progress.weeklyReports) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "当前实习暂无周报记录" });
      }

      let reports: Array<{
        createdAt: string;
        content: string;
        teacherFeedback?: string;
        feedbackAt?: string;
        teacherId?: number;
      }> = [];

      try {
        reports = JSON.parse(progress.weeklyReports) ?? [];
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "周报数据格式错误，无法添加反馈" });
      }

      if (input.index < 0 || input.index >= reports.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "无效的周报索引" });
      }

      const now = new Date().toISOString();
      reports[input.index] = {
        ...reports[input.index],
        teacherFeedback: input.feedback,
        teacherId: ctx.user.id,
        feedbackAt: now,
      };

      await db.updateInternshipProgress(input.applicationId, {
        weeklyReports: JSON.stringify(reports),
      });

      return { success: true };
    }),
});

