import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../core/framework/trpc";

// 重新导出基础 tRPC 工具，方便其他路由文件使用
export { router, publicProcedure, protectedProcedure };

// 权限验证中间件
export const studentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "student") {
    throw new TRPCError({ code: "FORBIDDEN", message: "仅限学生访问" });
  }
  return next({ ctx });
});

export const teacherProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "teacher") {
    throw new TRPCError({ code: "FORBIDDEN", message: "仅限教师访问" });
  }
  return next({ ctx });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "仅限管理员访问" });
  }
  return next({ ctx });
});

