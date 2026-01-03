# Server 文件夹结构说明

本文档详细说明 `server` 文件夹的组织结构和各模块的功能。

## 📁 目录概览

```
server/
├── core/                    # 核心框架和基础设施
│   ├── config/             # 配置管理模块
│   ├── framework/           # 框架初始化（Express、tRPC）
│   ├── middleware/          # 中间件（认证、Cookie）
│   ├── services/           # 核心服务（AI、系统路由）
│   └── utils/              # 工具函数（Vite 集成）
├── repositories/            # 数据访问层（Repository 模式）
├── routes/                  # API 路由定义（tRPC 路由）
├── services/                # 业务服务层
│   ├── ai/                 # AI 相关服务
│   └── storage/            # 文件存储服务
└── *.test.ts               # 测试文件
```

---

## 🏗️ 核心架构层 (`core/`)

### 1. 配置管理 (`core/config/`)

**作用**：统一管理所有环境变量和配置项

**文件说明**：
- `env-loader.ts` - 环境变量加载器，从 `.env` 文件读取配置
- `app.ts` - 应用配置（端口、开发模式等）
- `database.ts` - 数据库配置（连接字符串）
- `auth.ts` - 认证配置（JWT 密钥）
- `ai.ts` - AI 服务配置（OpenRouter API Key）
- `index.ts` - 统一导出所有配置，提供 `Config` 对象

**使用方式**：
```typescript
import { Config } from "../core/config";
const apiKey = Config.ai.requireOpenRouterApiKey();
const dbUrl = Config.database.url;
```

---

### 2. 框架初始化 (`core/framework/`)

**作用**：初始化 Express 服务器和 tRPC 框架

**文件说明**：

#### `express.ts`
- **功能**：Express 服务器的主入口
- **职责**：
  - 创建 Express 应用和 HTTP 服务器
  - 配置 body parser（支持大文件上传，50MB 限制）
  - 注册本地认证路由（登录、注册、登出）
  - 设置静态文件服务（`/uploads` 目录）
  - 挂载 tRPC API 路由（`/api/trpc`）
  - 开发模式集成 Vite，生产模式提供静态文件
  - 自动查找可用端口（默认 3000，如果被占用则递增）

#### `trpc.ts`
- **功能**：tRPC 框架配置
- **职责**：
  - 初始化 tRPC 实例（使用 `superjson` 作为序列化器）
  - 定义三种类型的 procedure：
    - `publicProcedure` - 公开接口，无需认证
    - `protectedProcedure` - 需要登录认证
    - `adminProcedure` - 需要管理员权限
  - 提供认证中间件，验证用户身份和角色

#### `context.ts`
- **功能**：tRPC 上下文创建
- **职责**：为每个 tRPC 请求创建上下文，包含当前用户信息

---

### 3. 中间件 (`core/middleware/`)

**作用**：处理认证、会话管理和 Cookie 操作

**文件说明**：

#### `auth.ts`
- **功能**：用户认证和会话管理
- **核心函数**：
  - `createSessionToken()` - 创建 JWT 会话令牌（有效期 1 年）
  - `verifySessionToken()` - 验证 JWT 令牌
  - `authenticateRequest()` - 从请求中提取并验证用户身份
  - `registerLocalAuthRoutes()` - 注册本地认证路由：
    - `POST /api/auth/login` - 登录
    - `POST /api/auth/register` - 注册
    - `GET /api/auth/me` - 获取当前用户信息
    - `POST /api/auth/logout` - 登出

#### `cookies.ts`
- **功能**：Cookie 配置和工具函数
- **职责**：提供 Cookie 选项（安全设置、域名等）

---

### 4. 核心服务 (`core/services/`)

**作用**：提供系统级服务

**文件说明**：

#### `ai/llm.ts`
- **功能**：LLM（大语言模型）调用服务
- **职责**：
  - 封装对 OpenRouter API 的调用（兼容 OpenAI Chat Completions 接口）
  - 支持消息格式转换（文本、图片、文件）
  - 支持工具调用（Tool Calling）
  - 支持 JSON Schema 模式（结构化输出）
  - 统一错误处理和日志记录
- **核心函数**：
  - `invokeLLM(params)` - 调用 LLM，返回响应结果

#### `ai/notification.ts`
- **功能**：通知服务（可能用于系统通知）

#### `system-router.ts`
- **功能**：系统级路由（健康检查、系统信息等）

---

### 5. 工具函数 (`core/utils/`)

**作用**：提供开发和生产环境的工具函数

**文件说明**：

#### `vite.ts`
- **功能**：Vite 集成工具
- **职责**：
  - `setupVite()` - 开发模式下设置 Vite 中间件（HMR、代理等）
  - `serveStatic()` - 生产模式下提供静态文件服务

---

## 💾 数据访问层 (`repositories/`)

**作用**：封装所有数据库操作，使用 Repository 模式

**设计理念**：
- 所有数据库操作都通过 Repository 层进行
- 使用 Drizzle ORM 进行类型安全的数据库查询
- 每个表对应一个 Repository 文件

**文件说明**：

#### `database.ts`
- **功能**：数据库连接管理
- **核心函数**：
  - `getDb()` - 获取 Drizzle ORM 实例（单例模式）

#### `user.repository.ts`
- **功能**：用户表操作
- **主要函数**：
  - `getUserById()`, `getUserByEmail()`, `upsertUser()`, `updateUserLastSignedIn()`

#### `student-profile.repository.ts`
- **功能**：学生档案表操作
- **主要函数**：
  - `getStudentProfileByUserId()`, `createStudentProfile()`, `updateStudentProfile()`

#### `teacher-profile.repository.ts`
- **功能**：教师档案表操作

#### `project.repository.ts`
- **功能**：项目表操作
- **主要函数**：
  - `getProjectById()`, `getProjectsByTeacherId()`, `createProject()`, `updateProject()`

#### `application.repository.ts`
- **功能**：申请记录表操作
- **主要函数**：
  - `getApplicationsByProjectId()`, `getApplicationsByTeacher()`, `createApplication()`, `updateApplicationStatus()`
- **特点**：包含 JOIN 查询，关联用户和学生档案表，返回完整的学生信息

#### `internship.repository.ts`
- **功能**：实习进度表操作

#### `match-cache.repository.ts`
- **功能**：匹配缓存表操作（AI 匹配结果缓存）

#### `notification.repository.ts`
- **功能**：通知表操作

#### `system-stats.repository.ts`
- **功能**：系统统计表操作

#### `index.ts`
- **功能**：统一导出所有 Repository 函数

---

## 🛣️ API 路由层 (`routes/`)

**作用**：定义所有 tRPC API 路由

**设计理念**：
- 按业务模块划分路由（学生、教师、项目、申请等）
- 每个路由文件对应一个业务领域
- 使用 tRPC 的类型安全特性

**文件说明**：

#### `index.ts`
- **功能**：聚合所有路由，创建主应用路由器
- **路由结构**：
  ```typescript
  appRouter = {
    system: systemRouter,
    auth: authRouter,
    studentProfile: studentRouter.profile,
    teacherProfile: teacherRouter.profile,
    project: { list, getById, myProjects, create, update },
    application: { myApplications, create, getMyById, listByTeacher, ... },
    internship: { getProgress, submitWeeklyReport, ... },
    notification: notificationRouter,
    ai: aiRouter,
    admin: adminRouter,
  }
  ```

#### `auth.ts`
- **功能**：认证相关路由
- **主要接口**：
  - `me` - 获取当前用户信息

#### `student.ts`
- **功能**：学生相关路由
- **主要接口**：
  - `profile.get` - 获取学生档案
  - `profile.create` - 创建学生档案
  - `profile.update` - 更新学生档案
  - `profile.uploadResume` - 上传简历（PDF 解析 + AI 提取）

#### `teacher.ts`
- **功能**：教师相关路由
- **主要接口**：
  - `profile.*` - 教师档案管理
  - `projects.*` - 项目管理（创建、更新、列表）
  - `applications.*` - 申请管理（列表、更新状态）
  - `internships.*` - 实习管理（创建、更新阶段、添加反馈）

#### `project.ts`
- **功能**：项目相关路由（公开接口）
- **主要接口**：
  - `list` - 获取项目列表
  - `getById` - 获取项目详情

#### `application.ts`
- **功能**：申请相关路由（学生端）
- **主要接口**：
  - `myApplications` - 获取我的申请列表
  - `create` - 创建申请
  - `getMyById` - 获取申请详情

#### `internship.ts`
- **功能**：实习相关路由
- **主要接口**：
  - `getProgress` - 获取实习进度
  - `submitWeeklyReport` - 提交周报

#### `ai.ts`
- **功能**：AI 相关路由
- **主要接口**：
  - `chat` - AI 智能助手对话
  - `bestApplicantsForProject` - AI 分析最匹配的申请人（教师端）

#### `admin.ts`
- **功能**：管理员相关路由
- **主要接口**：用户管理、项目管理、系统设置等

#### `notification.ts`
- **功能**：通知相关路由

#### `middleware.ts`
- **功能**：路由中间件定义
- **内容**：
  - `studentProcedure` - 学生角色验证
  - `teacherProcedure` - 教师角色验证
  - `router` - 路由创建函数

---

## 🔧 业务服务层 (`services/`)

**作用**：实现具体的业务逻辑

**文件说明**：

### AI 服务 (`services/ai/`)

#### `resume-ai-parser.ts`
- **功能**：使用 AI 解析简历文本
- **职责**：
  - 接收简历文本内容
  - 调用 LLM 提取结构化信息（学号、年级、专业、GPA、技能、研究兴趣、项目经验等）
  - 使用 JSON Schema 确保返回格式正确
  - 处理各种 LLM 响应格式（字符串 JSON、对象等）
- **核心函数**：
  - `parseResumeWithAI(resumeText)` - 解析简历并返回结构化数据

#### `match.ts`
- **功能**：AI 匹配服务
- **职责**：
  - 计算学生与项目的匹配度
  - 使用 LLM 分析申请人的匹配情况
  - 提供工具调用功能，允许 AI 读取数据库信息
- **特点**：支持工具调用（Tool Calling），AI 可以主动查询数据库

#### `match-local.ts`
- **功能**：本地匹配算法（可能作为 AI 匹配的备选方案）

### 文件服务 (`services/storage/`)

#### `index.ts`
- **功能**：存储服务统一接口

#### `local.ts`
- **功能**：本地文件存储实现
- **职责**：
  - 保存上传的文件到本地 `uploads/` 目录
  - 生成文件 URL
  - 管理文件存储路径

### 其他服务

#### `resume-parser.ts`
- **功能**：PDF 简历解析
- **职责**：
  - 使用 `pdfjs-dist` 库解析 PDF 文件
  - 提取 PDF 文本内容
  - 处理 Base64 编码的文件数据
- **核心函数**：
  - `parsePDF(buffer)` - 解析 PDF Buffer
  - `parsePDFFromBase64(base64)` - 从 Base64 解析 PDF

---

## 🔄 数据流向

```
前端请求
  ↓
Express 服务器 (express.ts)
  ↓
tRPC 中间件 (trpc.ts)
  ↓
路由层 (routes/*.ts)
  ↓
业务服务层 (services/*.ts)
  ↓
数据访问层 (repositories/*.ts)
  ↓
数据库 (MySQL via Drizzle ORM)
```

---

## 🎯 关键设计模式

### 1. **分层架构**
- **路由层**：处理 HTTP 请求和参数验证
- **服务层**：实现业务逻辑
- **数据访问层**：封装数据库操作

### 2. **Repository 模式**
- 所有数据库操作都通过 Repository 进行
- 便于测试和维护
- 统一的数据访问接口

### 3. **依赖注入**
- 配置通过 `Config` 对象统一管理
- 数据库连接通过 `getDb()` 获取
- 便于替换实现（如更换数据库、存储服务）

### 4. **类型安全**
- 使用 TypeScript + tRPC + Drizzle ORM
- 端到端的类型安全（前端到数据库）
- 编译时错误检查

---

## 📝 测试文件

- `auth.logout.test.ts` - 登出功能测试
- `routers.test.ts` - 路由测试

---

## 🚀 启动流程

1. **加载配置** (`core/config/env-loader.ts`)
   - 读取 `.env` 文件
   - 验证必需的环境变量

2. **初始化数据库** (`repositories/database.ts`)
   - 创建 Drizzle ORM 连接

3. **创建 Express 应用** (`core/framework/express.ts`)
   - 设置中间件
   - 注册路由
   - 启动服务器

4. **处理请求**
   - Express 接收请求
   - tRPC 中间件处理
   - 路由分发到对应的处理函数
   - 调用服务层和 Repository 层
   - 返回响应

---

## 📚 相关文档

- [数据库架构文档](./database/SCHEMA.md)
- [数据库操作文档](./database/DATABASE_OPERATIONS.md)
- [系统架构文档](./ARCHITECTURE_AND_INNOVATION.md)

