import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { studentProcedure, teacherProcedure, protectedProcedure, router } from "./middleware";
import * as db from "../repositories";
import * as aiMatch from "../services/ai/match";
import { invokeLLM } from "../core/services/ai/llm";

export const aiRouter = router({
  calculateMatch: studentProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getStudentProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "请先完善个人档案" });
      }
      const project = await db.getProjectById(input.projectId);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "项目不存在" });
      }
      const result = await aiMatch.calculateMatch(profile, {
        title: project.title,
        description: project.description,
        requiredSkills: project.requiredSkills || undefined,
        researchField: project.researchField || undefined,
        requirements: project.requirements || undefined,
      });
      return result;
    }),
  generateStatement: studentProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getStudentProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "请先完善个人档案" });
      }
      const project = await db.getProjectById(input.projectId);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "项目不存在" });
      }
      const statement = await aiMatch.generateApplicationStatement(profile, {
        title: project.title,
        description: project.description,
        researchField: project.researchField || undefined,
      });
      return { statement };
    }),
  expandDescription: teacherProcedure
    .input(
      z.object({
        keywords: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const description = await aiMatch.expandProjectDescription(input.keywords);
      return { description };
    }),
  bestApplicantsForProject: teacherProcedure
    .input(
      z.object({
        projectId: z.number(),
        topN: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "项目不存在" });
      }
      if (project.teacherId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权查看该项目的申请分析" });
      }

      // 查询该项目的申请及学生档案
      const rows = await db.getApplicationsByProjectId(input.projectId);
      const topN = input.topN ?? 5;

      const applicants = rows
        .map((row: any) => {
          const application = row.application;
          const profile = row.studentProfile;
          const user = row.user;

          return {
            applicationId: application.id,
            studentId: application.studentId,
            name: user?.name ?? `#${application.studentId}`,
            matchScore: application.matchScore ?? null,
            gpa: profile?.gpa ?? null,
            major: profile?.major ?? null,
            skills: profile?.skills ?? null,
            researchInterests: profile?.researchInterests ?? null,
            projectExperience: profile?.projectExperience ?? null,
          };
        })
        // 优先按匹配分排序
        .sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1))
        .slice(0, topN);

      if (applicants.length === 0) {
        return {
          applicants: [],
          analysis: "当前项目暂无申请人，无法进行AI分析。",
        };
      }

      const prompt = `你是一个科研导师助手。下面是项目「${project.title}」的申请人列表数据，请帮我分析谁最适合该项目，并给出客观理由。

申请人数据(JSON 数组)：
${JSON.stringify(applicants, null, 2)}

请用中文输出一段 Markdown 格式的分析内容，包含：
1. 总体评价
2. 推荐的前几位申请人及理由（请引用他们的匹配分数、GPA、专业、技能、项目经验等字段）
3. 如有明显不合适的申请人，也简单说明原因。
4. 最后给出对导师的建议（例如后续可重点沟通的对象）。`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "你是智研匹配系统的科研导师助手，擅长根据结构化数据帮助导师筛选最合适的学生。回答要客观、中立，并使用 Markdown 排版。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      const analysis =
        typeof content === "string"
          ? content
          : "AI 分析暂时不可用，请稍后重试。";

      return {
        applicants,
        analysis,
      };
    }),
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        history: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const reply = await aiMatch.chatWithAI(
        input.message,
        ctx.user.role,
        input.history || []
      );
      return { reply };
    }),
});

