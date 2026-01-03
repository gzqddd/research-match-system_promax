import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";

/**
 * 用户表 - 支持学生、教师、管理员三种角色
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: text("password_hash"), // bcrypt hash
  role: mysqlEnum("role", ["student", "teacher", "admin"]).default("student").notNull(),
  status: mysqlEnum("status", ["active", "pending", "banned"]).default("active").notNull(),
  notificationEnabled: boolean("notification_enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  roleIdx: index("role_idx").on(table.role),
  statusIdx: index("status_idx").on(table.status),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 学生档案表 - 存储学生的详细信息和技能档案
 */
export const studentProfiles = mysqlTable("student_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  studentId: varchar("student_id", { length: 50 }), // 学号
  grade: varchar("grade", { length: 20 }), // 年级
  major: varchar("major", { length: 100 }), // 专业
  gpa: varchar("gpa", { length: 10 }), // 绩点
  resumeUrl: text("resume_url"), // 简历文件URL
  resumeKey: text("resume_key"), // S3文件key
  skills: text("skills"), // JSON格式存储技能标签
  researchInterests: text("research_interests"), // 研究兴趣
  projectExperience: text("project_experience"), // 项目经验描述（自由文本）
  projectLinks: text("project_links"), // 项目链接列表(JSON数组：[{ name, url }])
  availableTime: varchar("available_time", { length: 50 }), // 可用时间
  status: mysqlEnum("status", ["idle", "internship"]).default("idle").notNull(), // 当前状态
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
}));

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = typeof studentProfiles.$inferInsert;

/**
 * 教师信息表 - 存储教师的详细信息
 */
export const teacherProfiles = mysqlTable("teacher_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  employeeId: varchar("employee_id", { length: 50 }), // 工号
  title: varchar("title", { length: 100 }), // 职称
  department: varchar("department", { length: 100 }), // 所属学院
  researchDirection: text("research_direction"), // 研究方向
  achievements: text("achievements"), // 科研成果(JSON)
  avatarUrl: text("avatar_url"), // 头像URL
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type TeacherProfile = typeof teacherProfiles.$inferSelect;
export type InsertTeacherProfile = typeof teacherProfiles.$inferInsert;

/**
 * 科研项目表 - 存储教师发布的科研项目
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(), // 项目详细描述(富文本)
  department: varchar("department", { length: 100 }), // 所属学院
  researchField: varchar("research_field", { length: 100 }), // 科研方向
  requirements: text("requirements"), // 任务要求(JSON)
  requiredSkills: text("required_skills"), // 所需技能(JSON)
  duration: varchar("duration", { length: 50 }), // 实习时长
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  recruitCount: int("recruit_count").default(1), // 招募人数
  currentCount: int("current_count").default(0), // 当前人数
  status: mysqlEnum("status", ["draft", "pending_review", "published", "rejected", "closed"]).default("draft").notNull(),
  viewCount: int("view_count").default(0), // 浏览次数
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  teacherIdx: index("teacher_idx").on(table.teacherId),
  statusIdx: index("status_idx").on(table.status),
  fieldIdx: index("field_idx").on(table.researchField),
}));

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * 申请记录表 - 存储学生的项目申请
 */
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  studentId: int("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  statement: text("statement"), // 申请陈述
  status: mysqlEnum("status", [
    "submitted",
    "screening_passed",
    "interview_scheduled",
    "accepted",
    "rejected"
  ]).default("submitted").notNull(),
  teacherFeedback: text("teacher_feedback"), // 教师反馈
  matchScore: int("match_score"), // AI匹配度分数(0-100)
  matchAnalysis: text("match_analysis"), // 匹配分析详情(JSON)
  interviewTime: timestamp("interview_time"), // 面试时间
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  projectIdx: index("project_idx").on(table.projectId),
  studentIdx: index("student_idx").on(table.studentId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * 实习进度表 - 跟踪学生的实习阶段
 */
export const internshipProgress = mysqlTable("internship_progress", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  stage: mysqlEnum("stage", [
    // 原有阶段
    "literature_review",
    "code_reproduction",
    "experiment_improvement",
    "completed",
    // 新增阶段以适配前端实习管理
    "onboarding",
    "ongoing",
    "paused"
  ]).default("onboarding").notNull(),
  weeklyReports: text("weekly_reports"), // 周报记录(JSON)
  stageEvaluations: text("stage_evaluations"), // 阶段评价(JSON)
  finalScore: int("final_score"), // 最终评分
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  applicationIdx: index("application_idx").on(table.applicationId),
}));

export type InternshipProgress = typeof internshipProgress.$inferSelect;
export type InsertInternshipProgress = typeof internshipProgress.$inferInsert;

/**
 * 系统通知表 - 存储用户通知消息
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 通知类型
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  relatedId: int("related_id"), // 关联的记录ID(如项目ID、申请ID)
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  readIdx: index("read_idx").on(table.isRead),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * AI匹配缓存表 - 缓存AI计算的匹配结果
 */
export const matchCache = mysqlTable("match_cache", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: int("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  matchScore: int("match_score").notNull(), // 匹配分数
  matchDetails: text("match_details").notNull(), // 匹配详情(JSON)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // 缓存过期时间
}, (table) => ({
  studentProjectIdx: index("student_project_idx").on(table.studentId, table.projectId),
  expiresIdx: index("expires_idx").on(table.expiresAt),
}));

export type MatchCache = typeof matchCache.$inferSelect;
export type InsertMatchCache = typeof matchCache.$inferInsert;

/**
 * 系统统计表 - 存储系统监控数据
 */
export const systemStats = mysqlTable("system_stats", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(), // 统计日期
  activeStudents: int("active_students").default(0), // 活跃学生数
  activeTeachers: int("active_teachers").default(0), // 活跃教师数
  newApplications: int("new_applications").default(0), // 新申请数
  matchSuccessRate: int("match_success_rate").default(0), // 匹配成功率(百分比)
  apiTokenUsage: int("api_token_usage").default(0), // API Token消耗
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  dateIdx: index("date_idx").on(table.date),
}));

export type SystemStats = typeof systemStats.$inferSelect;
export type InsertSystemStats = typeof systemStats.$inferInsert;
