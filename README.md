# 智研匹配系统 (Research Match System)

一个基于AI驱动的科研项目智能匹配平台，为学生和导师搭建高效的科研项目匹配桥梁。

---

## 📋 目录

- [系统概述](#系统概述)
- [技术架构](#技术架构)
- [核心功能](#核心功能)
- [项目结构](#项目结构)
- [模块详解](#模块详解)
- [开发指南](#开发指南)
- [数据库设计](#数据库设计)
- [API接口](#api接口)

---

## 🎯 系统概述

智研匹配系统是一个三端分离的科研项目管理平台：

- **学生端**: 浏览项目、AI智能推荐、在线申请、进度跟踪
- **教师端**: 发布项目、审核申请、AI辅助筛选、实习管理
- **管理员端**: 系统监控、用户管理、数据统计、权限配置

---

## 🛠 技术架构

### 前端技术栈
- **React 19**: 最新的React框架
- **Tailwind CSS 4**: 现代化的CSS框架
- **shadcn/ui**: 高质量的UI组件库
- **Wouter**: 轻量级路由库
- **tRPC Client**: 类型安全的API调用
- **Recharts**: 数据可视化图表库

### 后端技术栈
- **Express 4**: Node.js Web框架
- **tRPC 11**: 端到端类型安全的RPC框架
- **Drizzle ORM**: 类型安全的数据库ORM
- **MySQL/TiDB**: 关系型数据库
- **本地AI服务**: 基于本地算法的AI智能匹配

---

## ✨ 核心功能

### 1. 智能匹配系统
- AI分析学生档案与项目需求的匹配度
- 自动生成匹配分析报告（优势、不足、建议）
- 智能推荐最适合的科研项目

### 2. AI助手功能
- 全局AI对话助手（支持三端不同场景）
- 自动生成申请陈述
- AI扩写项目描述
- 智能生成面试题目

### 3. 权限管理
- 三端角色隔离（student/teacher/admin）
- 基于角色的访问控制（RBAC）
- 动态菜单渲染

### 4. 数据可视化
- 教师工作台数据图表
- 管理员监控大屏
- 申请趋势分析

---

## 📁 项目结构

```
research-match-system/
├── client/                    # 前端代码
│   ├── public/               # 静态资源
│   ├── src/
│   │   ├── components/       # 🔧 公共组件
│   │   │   ├── ui/          # shadcn/ui基础组件
│   │   │   ├── SystemLayout.tsx        # 系统布局组件
│   │   │   ├── AIAssistantDrawer.tsx   # AI助手抽屉
│   │   │   └── ProjectCard.tsx         # 项目卡片组件
│   │   ├── pages/            # 📄 页面组件
│   │   │   ├── student/     # 学生端页面
│   │   │   ├── teacher/     # 教师端页面
│   │   │   ├── admin/       # 管理员端页面
│   │   │   ├── Login.tsx    # 登录页面
│   │   │   └── RoleSelect.tsx # 角色选择页
│   │   │   ├── shared/          # 共享代码
│   │   │   └── hooks/       # 共享 Hooks
│   │   ├── lib/             # 工具库
│   │   │   └── trpc.ts      # tRPC客户端配置
│   │   ├── App.tsx          # 🚦 路由配置
│   │   └── index.css        # 🎨 全局样式
│   └── index.html
├── server/                   # 后端代码
│   ├── core/                 # 框架核心
│   │   ├── framework/      # Express, tRPC, Context
│   │   ├── middleware/     # 认证, Cookies
│   │   ├── utils/          # 工具函数
│   │   ├── services/       # 核心服务
│   │   └── config/         # 配置管理
│   ├── routes/              # 🔌 API路由定义
│   ├── repositories/        # 💾 数据访问层
│   ├── services/            # 🤖 业务服务（AI匹配等）
│   └── *.test.ts            # 单元测试文件
├── shared/                   # 共享代码
│   ├── const.ts             # 常量定义
│   └── types.ts              # 类型定义
├── drizzle/                 # 数据库相关
│   └── schema.ts            # 📊 数据库表结构
├── docs/                     # 📚 项目文档
│   ├── deployment/          # 部署文档
│   ├── development/         # 开发文档
│   └── refactoring/        # 重构文档
├── package.json             # 项目依赖
└── README.md               # 本文档
```

---

## 🔍 模块详解

### 📊 数据库模块 (`drizzle/schema.ts`)

**作用**: 定义所有数据库表结构

**包含的表**:
- `users`: 用户基础信息（包含角色字段）
- `student_profiles`: 学生档案（技能、经验、研究兴趣）
- `teacher_profiles`: 教师信息（职称、研究方向）
- `projects`: 科研项目信息
- `applications`: 学生申请记录
- `internship_progress`: 实习进度跟踪
- `notifications`: 系统通知
- `ai_match_cache`: AI匹配结果缓存

**如何修改**:
```typescript
// 1. 编辑 drizzle/schema.ts 添加或修改表结构
export const newTable = mysqlTable("new_table", {
  id: int("id").autoincrement().primaryKey(),
  // ... 其他字段
});

// 2. 运行数据库迁移
pnpm db:push
```

---

### 🔌 API路由模块 (`server/routes/`)

**作用**: 定义所有后端API接口

**主要路由分组**:
- `auth`: 用户认证相关
- `studentProfile`: 学生档案管理
- `teacherProfile`: 教师信息管理
- `project`: 项目管理
- `application`: 申请管理
- `ai`: AI功能接口
- `admin`: 管理员功能

**如何添加新接口**:
```typescript
// 在 server/routes/ 目录中创建新路由文件
// server/routes/new-feature.ts
import { protectedProcedure, router } from "../core/framework/trpc";
import * as db from "../repositories";

export const newFeatureRouter = router({
  getData: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      // 调用 repositories 中的查询函数
      return await db.getNewData(input.id);
    }),
});

// 在 server/routes/index.ts 中注册
export const appRouter = router({
  // ... 现有路由
  newFeature: newFeatureRouter,
});
```

---

### 💾 数据访问层 (`server/repositories/`)

**作用**: 封装所有数据库查询操作

**如何添加新查询**:
```typescript
// 在 server/repositories/ 目录中创建新的 repository 文件
// server/repositories/new-feature.repository.ts
import { eq } from "drizzle-orm";
import { yourTable } from "../../drizzle/schema";
import { getDb } from "./database";

export async function getNewData(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(yourTable)
    .where(eq(yourTable.id, id))
    .limit(1);
    
  return result[0];
}

// 在 server/repositories/index.ts 中导出
export * from "./new-feature.repository";
```

---

### 🤖 AI匹配模块 (`server/services/ai/match.ts`)

**作用**: 实现AI智能匹配和辅助功能

**核心函数**:
- `calculateMatch()`: 计算学生与项目的匹配度
- `generateApplicationStatement()`: 生成申请陈述
- `expandProjectDescription()`: 扩写项目描述
- `chatWithAI()`: AI助手对话

**如何修改AI提示词**:
```typescript
// 在 server/services/ai/match.ts 中修改对应函数的 prompt
const prompt = `你是一个科研项目匹配专家...
// 修改这里的提示词来调整AI行为
`;
```

---

### 🎨 全局样式模块 (`client/src/index.css`)

**作用**: 定义全局主题色、字体、间距等

**如何修改主题色**:
```css
/* 在 client/src/index.css 中修改 */
@layer base {
  :root {
    --primary: 210 100% 50%;  /* 主色调 */
    --secondary: 200 100% 45%; /* 次要色 */
    /* ... 其他颜色变量 */
  }
}
```

---

### 🔧 公共组件模块 (`client/src/components/`)

#### SystemLayout.tsx
**作用**: 系统主布局（侧边栏+顶部栏+内容区）

**如何修改侧边栏菜单**:
```typescript
// 在 SystemLayout.tsx 中修改 menuItems
const menuItems = {
  student: [
    { path: "/dashboard", label: "首页", icon: Home },
    // 添加新菜单项
    { path: "/new-page", label: "新功能", icon: NewIcon },
  ],
};
```

#### AIAssistantDrawer.tsx
**作用**: 全局AI助手对话界面

**如何修改预设问题**:
```typescript
// 在 AIAssistantDrawer.tsx 中修改 presetPrompts
const presetPrompts = user?.role === "student"
  ? [
      "如何提高我的匹配度?",
      // 添加新的预设问题
      "如何准备面试?",
    ]
  : // ...
```

#### ProjectCard.tsx
**作用**: 项目展示卡片组件

**如何修改卡片样式**: 直接编辑组件的Tailwind类名

---

### 📄 页面组件模块 (`client/src/pages/`)

#### 学生端页面 (`pages/student/`)
- `Dashboard.tsx`: 学生仪表盘（数据卡片+AI推荐）
- `Projects.tsx`: 项目广场（筛选+列表）
- `MyApplications.tsx`: 我的申请（表格+状态）
- `Profile.tsx`: 个人档案管理

#### 教师端页面 (`pages/teacher/`)
- `Dashboard.tsx`: 教师工作台（数据概览+图表）
- `Projects.tsx`: 项目管理列表

#### 管理员端页面 (`pages/admin/`)
- `Dashboard.tsx`: 系统监控大屏

**如何添加新页面**:
```typescript
// 1. 在对应目录创建新页面组件
// client/src/pages/student/NewPage.tsx
export default function NewPage() {
  return <SystemLayout>{/* 页面内容 */}</SystemLayout>;
}

// 2. 在 App.tsx 中添加路由
<Route path="/new-page">
  {() => <ProtectedRoute component={NewPage} allowedRoles={["student"]} />}
</Route>

// 3. 在 SystemLayout.tsx 中添加菜单项
```

---

### 🚦 路由配置 (`client/src/App.tsx`)

**作用**: 定义所有页面路由和权限控制

**路由结构**:
- `/login`: 登录页（公开）
- `/role-select`: 角色选择（需登录）
- `/dashboard`: 学生首页（仅学生）
- `/teacher/*`: 教师端路由（仅教师）
- `/admin/*`: 管理员端路由（仅管理员）

**如何添加新路由**: 参考上面"如何添加新页面"部分

---

## 🚀 开发指南

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查
pnpm check

# 运行测试
pnpm test

# 数据库迁移
pnpm db:push
```

### 常见开发场景

#### 场景1: 添加新的学生端功能

1. **创建页面**: `client/src/pages/student/NewFeature.tsx`
2. **添加路由**: 在`App.tsx`中注册路由
3. **添加菜单**: 在`SystemLayout.tsx`中添加菜单项
4. **创建API**: 在`server/routes/`中创建路由文件
5. **数据访问**: 在`server/repositories/`中创建 repository
6. **数据库**: 如需新表，在`drizzle/schema.ts`中定义

#### 场景2: 修改AI匹配算法

1. 打开`server/services/ai/match.ts`
2. 找到`calculateMatch()`函数
3. 修改提示词或评分逻辑
4. 重启服务器测试

#### 场景3: 调整页面样式

1. **全局样式**: 修改`client/src/index.css`
2. **组件样式**: 直接修改组件中的Tailwind类名
3. **主题色**: 在`index.css`的`:root`中修改CSS变量

#### 场景4: 添加新的数据统计

1. 在`server/repositories/`中添加统计查询函数
2. 在`server/routes/`中暴露API
3. 在对应的Dashboard页面中调用并展示

---

## 📊 数据库设计

### 核心表关系

```
users (用户表)
  ├── student_profiles (1:1) - 学生档案
  ├── teacher_profiles (1:1) - 教师信息
  └── notifications (1:N) - 用户通知

projects (项目表)
  ├── teacher_id → users.id (N:1)
  └── applications (1:N) - 项目申请

applications (申请表)
  ├── student_id → users.id (N:1)
  ├── project_id → projects.id (N:1)
  └── internship_progress (1:N) - 实习进度

ai_match_cache (AI缓存表)
  ├── student_id → users.id (N:1)
  └── project_id → projects.id (N:1)
```

### 关键字段说明

**users表**:
- `role`: 用户角色（student/teacher/admin）
- `openId`: 用户唯一标识（本地认证）

**projects表**:
- `status`: 项目状态（draft/published/closed）
- `requiredSkills`: JSON格式的技能要求

**applications表**:
- `status`: 申请状态（submitted/screening_passed/interview_scheduled/accepted/rejected）
- `matchScore`: AI计算的匹配分数

---

## 🔌 API接口

### 认证接口 (`auth`)
- `auth.me`: 获取当前用户信息
- `auth.logout`: 退出登录
- `auth.updateRole`: 更新用户角色

### 学生档案接口 (`studentProfile`)
- `studentProfile.get`: 获取个人档案
- `studentProfile.create`: 创建档案
- `studentProfile.update`: 更新档案

### 项目接口 (`project`)
- `project.list`: 获取项目列表（公开）
- `project.myProjects`: 获取我的项目（教师）
- `project.create`: 创建项目
- `project.update`: 更新项目

### 申请接口 (`application`)
- `application.myApplications`: 我的申请列表
- `application.create`: 提交申请
- `application.updateStatus`: 更新申请状态

### AI接口 (`ai`)
- `ai.calculateMatch`: 计算匹配度
- `ai.generateStatement`: 生成申请陈述
- `ai.expandDescription`: 扩写项目描述
- `ai.chat`: AI助手对话

### 管理员接口 (`admin`)
- `admin.stats`: 系统统计数据
- `admin.users`: 用户列表
- `admin.updateUserRole`: 更新用户角色

---

## 📝 开发规范

### 代码风格
- 使用TypeScript严格模式
- 遵循ESLint规则
- 组件使用函数式组件
- 优先使用Tailwind CSS

### 命名规范
- 组件文件: PascalCase (如`ProjectCard.tsx`)
- 函数/变量: camelCase (如`getUserData`)
- 常量: UPPER_SNAKE_CASE (如`API_URL`)
- 数据库表: snake_case (如`student_profiles`)

### Git提交规范
```
feat: 添加新功能
fix: 修复bug
style: 样式调整
refactor: 代码重构
docs: 文档更新
test: 测试相关
```

---

## 🧪 测试

### 运行测试
```bash
pnpm test
```

### 测试文件位置
- `server/*.test.ts`: 后端单元测试
- `server/auth.logout.test.ts`: 认证测试示例
- `server/routers.test.ts`: API路由测试

### 添加新测试
```typescript
// 在 server/your-feature.test.ts
import { describe, expect, it } from "vitest";

describe("Your Feature", () => {
  it("should work correctly", async () => {
    // 测试代码
    expect(result).toBe(expected);
  });
});
```

---

## 🔒 权限系统

### 角色定义
- `student`: 学生，可浏览项目、提交申请
- `teacher`: 教师，可发布项目、审核申请
- `admin`: 管理员，可管理用户、查看统计

### 权限控制实现
```typescript
// 后端权限中间件
const studentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "student") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

// 前端路由保护
<ProtectedRoute component={StudentPage} allowedRoles={["student"]} />
```

---

## 🐛 常见问题

### Q: 如何修改登录页的宣传文案？
A: 编辑`client/src/pages/Login.tsx`，修改左侧区域的文本内容。

### Q: 如何调整AI匹配的评分标准？
A: 编辑`server/services/ai/match.ts`中的`calculateMatch()`函数，修改提示词中的评分标准部分。

### Q: 如何添加新的用户角色？
A: 
1. 修改`drizzle/schema.ts`中`users`表的`role`枚举
2. 运行`pnpm db:push`
3. 在`server/routers.ts`中添加对应的权限中间件
4. 在`SystemLayout.tsx`中添加对应的菜单配置

### Q: 数据库连接失败怎么办？
A: 检查环境变量`DATABASE_URL`是否正确配置，确保数据库服务正常运行。

---

## 📞 技术支持

如有问题，请查看：
- **项目文档**: 本README
- **完整文档**: [docs/README.md](./docs/README.md)
  - [部署文档](./docs/deployment/) - 部署指南和快速部署
  - [开发文档](./docs/development/) - 环境配置和项目结构
  - [重构文档](./docs/refactoring/) - 重构计划和总结

---

## 📄 许可证

MIT License

---

**最后更新**: 2024年12月
**版本**: v1.0
