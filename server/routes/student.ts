import { z } from "zod";
import { studentProcedure, router } from "./middleware";
import * as db from "../repositories";
import * as storage from "../services/storage";
import { parsePDFFromBase64 } from "../services/resume-parser";
import { parseResumeWithAI } from "../services/ai/resume-ai-parser";

export const studentRouter = router({
  profile: router({
    get: studentProcedure.query(async ({ ctx }) => {
      const profile = await db.getStudentProfileByUserId(ctx.user.id);
      return profile ?? null;
    }),
    create: studentProcedure
      .input(
        z.object({
          studentId: z.string().optional(),
          grade: z.string().optional(),
          major: z.string().optional(),
          gpa: z.string().optional(),
          resumeUrl: z.string().optional(),
          resumeKey: z.string().optional(),
          skills: z.string().optional(),
          researchInterests: z.string().optional(),
          projectExperience: z.string().optional(),
          availableTime: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createStudentProfile({
          userId: ctx.user.id,
          ...input,
        });
      }),
    update: studentProcedure
      .input(
        z.object({
          studentId: z.string().optional(),
          grade: z.string().optional(),
          major: z.string().optional(),
          gpa: z.string().optional(),
          resumeUrl: z.string().optional(),
          resumeKey: z.string().optional(),
          skills: z.string().optional(),
          researchInterests: z.string().optional(),
          projectExperience: z.string().optional(),
          availableTime: z.string().optional(),
          status: z.enum(["idle", "internship"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.updateStudentProfile(ctx.user.id, input);
        return { success: true };
      }),
    uploadResume: studentProcedure
      .input(
        z.object({
          file: z.string(), // Base64编码的PDF文件
          fileName: z.string(),
          fileSize: z.number().max(10 * 1024 * 1024), // 10MB限制
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 验证文件类型
        if (!input.fileName.toLowerCase().endsWith(".pdf")) {
          throw new Error("仅支持PDF格式文件");
        }

        // 验证文件大小（Base64编码后大约增加33%）
        const estimatedSize = (input.file.length * 3) / 4;
        if (estimatedSize > 10 * 1024 * 1024) {
          throw new Error("文件大小不能超过10MB");
        }

        try {
          // 1. 解析PDF文本
          const parseResult = await parsePDFFromBase64(input.file);
          
          // 验证解析结果
          if (!parseResult || !parseResult.text) {
            throw new Error("PDF解析失败：未能提取文本内容");
          }

          console.log(`[Upload Resume] PDF解析成功，提取了 ${parseResult.text.length} 个字符`);
          
          // 2. 使用AI提取结构化信息
          const parsedData = await parseResumeWithAI(parseResult.text);

          // 3. 保存文件到本地存储
          const fileKey = `resumes/user-${ctx.user.id}/${Date.now()}-${input.fileName}`;
          const pdfBuffer = Buffer.from(
            input.file.includes(",") ? input.file.split(",")[1] : input.file,
            "base64"
          );
          
          const { key, url } = await storage.storagePut(fileKey, pdfBuffer, "application/pdf");

          // 4. 更新或创建学生档案（同时写入解析出的字段）
          const existingProfile = await db.getStudentProfileByUserId(ctx.user.id);

          // 根据 parsedData 生成要更新的字段（只填有值的，避免覆盖为空）
          const profileUpdates: Record<string, string | null | undefined> = {
            resumeUrl: url,
            resumeKey: key,
          };

          if (parsedData.studentId) profileUpdates.studentId = parsedData.studentId;
          if (parsedData.grade) profileUpdates.grade = parsedData.grade;
          if (parsedData.major) profileUpdates.major = parsedData.major;
          if (parsedData.gpa) profileUpdates.gpa = parsedData.gpa;
          if (parsedData.skills) profileUpdates.skills = parsedData.skills;
          if (parsedData.researchInterests) profileUpdates.researchInterests = parsedData.researchInterests;
          if (parsedData.projectExperience) profileUpdates.projectExperience = parsedData.projectExperience;
          if (parsedData.availableTime) profileUpdates.availableTime = parsedData.availableTime;
          
          if (existingProfile) {
            // 如果已有旧简历，删除旧文件
            if (existingProfile.resumeKey) {
              try {
                await storage.storageDelete(existingProfile.resumeKey);
              } catch (error) {
                console.warn("[Upload Resume] 删除旧简历失败:", error);
              }
            }
            
            // 更新档案：写入简历URL + 解析出的字段
            await db.updateStudentProfile(ctx.user.id, profileUpdates);
          } else {
            // 创建新档案：写入所有可用字段
            await db.createStudentProfile({
              userId: ctx.user.id,
              ...profileUpdates,
            });
          }

          return {
            success: true,
            resumeUrl: url,
            resumeKey: key,
            parsedData,
          };
        } catch (error) {
          console.error("[Upload Resume] 错误:", error);
          throw new Error(
            error instanceof Error 
              ? error.message 
              : "简历上传失败，请重试"
          );
        }
      }),
  }),
});

