import { router } from "../core/framework/trpc";
import { systemRouter } from "../core/services/system-router";
import { authRouter } from "./auth";
import { studentRouter } from "./student";
import { teacherRouter } from "./teacher";
import { projectRouter } from "./project";
import { applicationRouter } from "./application";
import { internshipRouter } from "./internship";
import { notificationRouter } from "./notification";
import { aiRouter } from "./ai";
import { adminRouter } from "./admin";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  studentProfile: studentRouter.profile,
  teacherProfile: teacherRouter.profile,
  project: router({
    list: projectRouter.list,
    getById: projectRouter.getById,
    myProjects: teacherRouter.projects.myProjects,
    create: teacherRouter.projects.create,
    update: teacherRouter.projects.update,
  }),
  application: router({
    myApplications: applicationRouter.myApplications,
    create: applicationRouter.create,
    getMyById: applicationRouter.getMyById,
    listByTeacher: teacherRouter.applications.list,
    projectApplications: teacherRouter.applications.projectApplications,
    updateStatus: teacherRouter.applications.updateStatus,
  }),
  internship: router({
    getProgress: internshipRouter.getProgress,
    submitWeeklyReport: internshipRouter.submitWeeklyReport,
    listByTeacher: teacherRouter.internships.list,
    create: teacherRouter.internships.create,
    updateStage: teacherRouter.internships.updateStage,
  }),
  notification: notificationRouter,
  ai: aiRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

