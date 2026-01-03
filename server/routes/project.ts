import { z } from "zod";
import { publicProcedure, router } from "./middleware";
import * as db from "../repositories";

export const projectRouter = router({
  list: publicProcedure.query(async () => {
    return await db.getAllPublishedProjects();
  }),
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    await db.incrementProjectViewCount(input.id);
    return await db.getProjectById(input.id);
  }),
});

