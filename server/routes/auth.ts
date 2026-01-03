import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../core/middleware/cookies";
import { publicProcedure, protectedProcedure, router } from "../core/framework/trpc";
import * as db from "../repositories";

export const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        notificationEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.updateUserCore(ctx.user.id, input);
      return { success: true };
    }),
});

