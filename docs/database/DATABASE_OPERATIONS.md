# 数据库操作架构说明

## 📍 数据库操作入口

你的代码通过 **Drizzle ORM** 操作数据库，采用三层架构：

```
路由层 (Routes) 
    ↓
Repository层 (数据访问层)
    ↓
数据库连接层 (Database Connection)
    ↓
MySQL数据库
```

---

## 🔧 核心文件位置

### 1. 数据库连接层
**文件**: `server/repositories/database.ts`

**作用**: 提供数据库连接实例

```typescript
import { drizzle } from "drizzle-orm/mysql2";
import { Config } from "../core/config";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && Config.database.url) {
    try {
      _db = drizzle(Config.database.url);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
```

**说明**:
- 使用 `drizzle-orm/mysql2` 连接 MySQL
- 从 `Config.database.url` 读取连接字符串（来自 `.env` 的 `DATABASE_URL`）
- 单例模式，全局共享一个数据库连接实例

---

### 2. Repository层（数据访问层）

**位置**: `server/repositories/` 目录

**文件列表**:
- `database.ts` - 数据库连接
- `user.repository.ts` - 用户表操作
- `student-profile.repository.ts` - 学生档案操作
- `teacher-profile.repository.ts` - 教师信息操作
- `project.repository.ts` - 项目表操作
- `application.repository.ts` - 申请记录操作
- `internship.repository.ts` - 实习进度操作
- `notification.repository.ts` - 通知表操作
- `match-cache.repository.ts` - 匹配缓存操作
- `system-stats.repository.ts` - 系统统计操作
- `index.ts` - 统一导出所有repository函数

**示例** (`server/repositories/user.repository.ts`):
```typescript
import { eq } from "drizzle-orm";
import { users, type InsertUser, type User } from "../../drizzle/schema";
import { getDb } from "./database";

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  await db.insert(users).values(user).onDuplicateKeyUpdate({
    set: { /* ... */ }
  });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  
  return result[0] ?? null;
}
```

**统一导出** (`server/repositories/index.ts`):
```typescript
export * from "./database";
export * from "./user.repository";
export * from "./student-profile.repository";
// ... 其他repository
```

---

### 3. 路由层（API接口层）

**位置**: `server/routes/` 目录

**文件列表**:
- `index.ts` - 路由入口
- `auth.ts` - 认证相关
- `student.ts` - 学生相关接口
- `teacher.ts` - 教师相关接口
- `project.ts` - 项目相关接口
- `application.ts` - 申请相关接口
- `internship.ts` - 实习相关接口
- `ai.ts` - AI功能接口
- `admin.ts` - 管理员接口
- `notification.ts` - 通知接口
- `middleware.ts` - 中间件（权限验证等）

**示例** (`server/routes/student.ts`):
```typescript
import { z } from "zod";
import { studentProcedure, router } from "./middleware";
import * as db from "../repositories";  // 导入所有repository函数

export const studentRouter = router({
  profile: router({
    get: studentProcedure.query(async ({ ctx }) => {
      // 调用repository层的函数
      const profile = await db.getStudentProfileByUserId(ctx.user.id);
      return profile ?? null;
    }),
    
    update: studentProcedure
      .input(z.object({ /* ... */ }))
      .mutation(async ({ ctx, input }) => {
        // 调用repository层的函数
        return await db.updateStudentProfile(ctx.user.id, input);
      }),
  }),
});
```

---

## 🔄 数据操作流程

### 示例：更新学生档案

```
1. 前端请求
   POST /api/trpc/student.profile.update
   
2. 路由层 (server/routes/student.ts)
   studentRouter.profile.update.mutation()
   ↓
   调用 db.updateStudentProfile()
   
3. Repository层 (server/repositories/student-profile.repository.ts)
   updateStudentProfile()
   ↓
   调用 getDb() 获取数据库连接
   ↓
   执行 SQL: UPDATE student_profiles SET ...
   
4. 数据库连接层 (server/repositories/database.ts)
   getDb() 返回 drizzle 实例
   
5. MySQL数据库
   执行更新操作
```

---

## 📝 如何添加新的数据库操作

### 步骤1: 在Repository层添加函数

**文件**: `server/repositories/xxx.repository.ts`

```typescript
import { eq } from "drizzle-orm";
import { xxxTable, type InsertXxx } from "../../drizzle/schema";
import { getDb } from "./database";

export async function createXxx(data: InsertXxx) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(xxxTable).values(data);
  return result;
}

export async function getXxxById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(xxxTable)
    .where(eq(xxxTable.id, id))
    .limit(1);
  
  return result[0] ?? null;
}
```

### 步骤2: 在Repository的index.ts中导出

**文件**: `server/repositories/index.ts`

```typescript
export * from "./xxx.repository";
```

### 步骤3: 在路由层使用

**文件**: `server/routes/xxx.ts`

```typescript
import * as db from "../repositories";

export const xxxRouter = router({
  create: procedure
    .input(z.object({ /* ... */ }))
    .mutation(async ({ input }) => {
      return await db.createXxx(input);
    }),
});
```

---

## 🔍 常用数据库操作模式

### 1. 查询单条记录
```typescript
const db = await getDb();
const result = await db
  .select()
  .from(users)
  .where(eq(users.id, userId))
  .limit(1);
return result[0] ?? null;
```

### 2. 查询多条记录
```typescript
const db = await getDb();
const result = await db
  .select()
  .from(projects)
  .where(eq(projects.teacherId, teacherId))
  .orderBy(desc(projects.createdAt));
return result;
```

### 3. 插入记录
```typescript
const db = await getDb();
const result = await db.insert(users).values({
  openId: "xxx",
  name: "xxx",
  // ...
});
return result;
```

### 4. 更新记录
```typescript
const db = await getDb();
await db
  .update(users)
  .set({ name: "新名字" })
  .where(eq(users.id, userId));
```

### 5. 删除记录
```typescript
const db = await getDb();
await db
  .delete(users)
  .where(eq(users.id, userId));
```

### 6. JOIN查询
```typescript
const db = await getDb();
const result = await db
  .select({
    application: applications,
    user: users,
    studentProfile: studentProfiles,
  })
  .from(applications)
  .leftJoin(users, eq(applications.studentId, users.id))
  .leftJoin(studentProfiles, eq(users.id, studentProfiles.userId))
  .where(eq(applications.projectId, projectId));
```

---

## 🗂️ 数据库Schema定义

**文件**: `drizzle/schema.ts`

所有表结构都在这里定义，使用 Drizzle ORM 的语法：

```typescript
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  // ...
});
```

**修改Schema后**:
```bash
# 推送变更到数据库
pnpm db:push
```

---

## 🔐 数据库配置

**配置文件**: `server/core/config/database.ts`

**环境变量**: `.env` 文件中的 `DATABASE_URL`

**格式**: `mysql://用户名:密码@主机:端口/数据库名`

**示例**:
```
DATABASE_URL=mysql://Liuliu:123456@localhost:3306/research_match_system
```

---

## 📚 相关文档

- [数据库Schema说明](./SCHEMA.md) - 详细的表结构文档
- [Drizzle ORM官方文档](https://orm.drizzle.team/docs/overview) - ORM框架文档

---

*最后更新: 2024年*

