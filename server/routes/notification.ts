import { z } from "zod";
import { protectedProcedure, router } from "./middleware";
import * as db from "../repositories";

export const notificationRouter = router({
  list: protectedProcedure.input(z.object({ unreadOnly: z.boolean().optional() })).query(async ({ ctx, input }) => {
    return await db.getNotificationsByUserId(ctx.user.id, input.unreadOnly);
  }),
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUnreadNotificationCount(ctx.user.id);
  }),
  markAsRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.markNotificationAsRead(input.id);
    return { success: true };
  }),
});

