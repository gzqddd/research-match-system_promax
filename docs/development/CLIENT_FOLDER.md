# Client 文件夹结构说明

## 📁 目录概览

`client/` 文件夹包含整个前端应用的源代码，使用 **React 19** + **TypeScript** 构建。

```
client/
├── index.html          # HTML入口文件
├── public/             # 静态资源目录（图片、字体等）
└── src/                # 源代码目录
    ├── main.tsx        # 应用入口文件
    ├── App.tsx         # 路由配置和主应用组件
    ├── index.css       # 全局样式
    ├── const.ts        # 前端常量定义
    ├── components/     # 组件目录
    ├── pages/          # 页面目录
    ├── contexts/       # React Context（全局状态）
    ├── hooks/          # 自定义 Hooks
    ├── lib/            # 工具库
    └── shared/          # 共享代码
```

---

## 📄 根目录文件

### `index.html`
- **作用**: HTML 入口文件
- **内容**: 
  - 页面标题：`智研匹配系统`
  - 根元素 `<div id="root"></div>` - React 挂载点
  - 脚本引用：`/src/main.tsx`

### `public/`
- **作用**: 静态资源目录
- **内容**: 图片、字体、图标等静态文件
- **说明**: 构建时会被复制到 `dist/public/`

---

## 🚀 核心文件 (`src/`)

### `main.tsx` - 应用入口
**作用**: React 应用的启动入口

**主要功能**:
1. **创建 tRPC 客户端**: 配置与后端的 API 连接
2. **创建 QueryClient**: React Query 的查询客户端
3. **错误处理**: 自动处理未授权错误，重定向到登录页
4. **渲染根组件**: 将 `<App />` 挂载到 DOM

**关键代码**:
```typescript
// tRPC 客户端配置
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",  // 后端 API 地址
      transformer: superjson,  // 数据序列化
    }),
  ],
});

// 渲染应用
createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient}>
    <App />
  </trpc.Provider>
);
```

---

### `App.tsx` - 路由配置
**作用**: 定义所有页面路由和权限控制

**主要功能**:
1. **路由定义**: 使用 `wouter` 定义所有页面路由
2. **权限控制**: `ProtectedRoute` 组件保护需要登录的页面
3. **角色隔离**: 根据用户角色（student/teacher/admin）显示不同页面
4. **错误边界**: `ErrorBoundary` 捕获渲染错误

**路由结构**:
```
/                    → Home（首页）
/login               → Login（登录页）
/role-select         → RoleSelect（角色选择）
/dashboard           → 根据角色跳转
  /student/*         → 学生端页面
  /teacher/*         → 教师端页面
  /admin/*           → 管理员端页面
```

---

### `index.css` - 全局样式
**作用**: 全局 CSS 样式和 Tailwind CSS 配置

---

### `const.ts` - 常量定义
**作用**: 前端使用的常量（如 URL、配置等）

---

## 🧩 组件目录 (`components/`)

### 业务组件

#### `SystemLayout.tsx`
- **作用**: 系统主布局组件
- **功能**: 包含侧边栏、顶部导航、AI 助手按钮等

#### `DashboardLayout.tsx`
- **作用**: 仪表板布局组件
- **功能**: 为各个 Dashboard 页面提供统一布局

#### `DashboardLayoutSkeleton.tsx`
- **作用**: 加载骨架屏
- **功能**: 页面加载时显示的占位符

#### `AIAssistantDrawer.tsx`
- **作用**: AI 助手抽屉组件
- **功能**: 全局 AI 对话助手，支持三端不同场景

#### `AIChatBox.tsx`
- **作用**: AI 聊天框组件
- **功能**: 处理 AI 对话的消息显示和输入

#### `ProjectCard.tsx`
- **作用**: 项目卡片组件
- **功能**: 展示项目信息的卡片

#### `ErrorBoundary.tsx`
- **作用**: 错误边界组件
- **功能**: 捕获子组件的渲染错误，显示友好错误页面

#### `Map.tsx`
- **作用**: 地图组件（如果使用）

---

### UI 组件库 (`components/ui/`)

**作用**: 基于 **shadcn/ui** 的基础 UI 组件库（60+ 组件）

**主要组件**:
- **表单组件**: `button.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`
- **布局组件**: `card.tsx`, `sheet.tsx`, `dialog.tsx`, `drawer.tsx`, `sidebar.tsx`
- **反馈组件**: `alert.tsx`, `toast.tsx` (sonner), `progress.tsx`, `skeleton.tsx`, `spinner.tsx`
- **导航组件**: `tabs.tsx`, `breadcrumb.tsx`, `navigation-menu.tsx`, `menubar.tsx`
- **数据展示**: `table.tsx`, `chart.tsx`, `badge.tsx`, `avatar.tsx`
- **其他**: `tooltip.tsx`, `popover.tsx`, `dropdown-menu.tsx`, `accordion.tsx` 等

**特点**:
- ✅ 完全类型安全（TypeScript）
- ✅ 可访问性（Accessibility）支持
- ✅ 深色模式支持
- ✅ 高度可定制

---

## 📄 页面目录 (`pages/`)

### 公共页面

#### `Home.tsx`
- **作用**: 首页
- **功能**: 系统介绍、快速入口

#### `Login.tsx`
- **作用**: 登录页面
- **功能**: 用户登录（邮箱+密码）

#### `RoleSelect.tsx`
- **作用**: 角色选择页面
- **功能**: 登录后选择角色（学生/教师/管理员）

#### `NotFound.tsx`
- **作用**: 404 页面
- **功能**: 页面不存在时显示

#### `Settings.tsx`
- **作用**: 通用设置页面
- **功能**: 用户个人设置

#### `ComponentShowcase.tsx`
- **作用**: 组件展示页面（开发用）
- **功能**: 展示所有 UI 组件的使用示例

---

### 学生端页面 (`pages/student/`)

#### `Dashboard.tsx`
- **作用**: 学生仪表板
- **功能**: 显示推荐项目、申请状态、统计数据

#### `Projects.tsx`
- **作用**: 项目列表页
- **功能**: 浏览所有可申请的项目

#### `ProjectDetail.tsx`
- **作用**: 项目详情页
- **功能**: 查看项目详细信息，支持 Markdown 渲染

#### `ProjectApply.tsx`
- **作用**: 项目申请页
- **功能**: 填写申请表单，AI 生成申请陈述

#### `MyApplications.tsx`
- **作用**: 我的申请列表
- **功能**: 查看所有已提交的申请

#### `ApplicationDetail.tsx`
- **作用**: 申请详情页
- **功能**: 查看申请状态、教师反馈、匹配分析

#### `ApplicationReport.tsx`
- **作用**: 申请报告页
- **功能**: 查看申请的分析报告

#### `Profile.tsx`
- **作用**: 个人档案页
- **功能**: 
  - 编辑个人信息
  - 上传简历（PDF 自动解析）
  - 管理项目链接（GitHub 等）

---

### 教师端页面 (`pages/teacher/`)

#### `Dashboard.tsx`
- **作用**: 教师仪表板
- **功能**: 显示项目统计、申请数量、数据图表

#### `Projects.tsx`
- **作用**: 我的项目列表
- **功能**: 管理自己发布的项目

#### `ProjectNew.tsx`
- **作用**: 创建新项目页
- **功能**: 填写项目信息，AI 扩展项目描述

#### `ProjectApplications.tsx`
- **作用**: 项目申请列表
- **功能**: 查看某个项目的所有申请，AI 分析最匹配申请人

#### `Applications.tsx`
- **作用**: 所有申请列表
- **功能**: 查看所有项目的申请，筛选、审核

#### `Internships.tsx`
- **作用**: 实习管理页
- **功能**: 
  - 管理学生实习进度
  - 查看周报
  - 添加教师反馈

---

### 管理员端页面 (`pages/admin/`)

#### `Dashboard.tsx`
- **作用**: 管理员仪表板
- **功能**: 系统整体数据统计、监控大屏

#### `Users.tsx`
- **作用**: 用户管理页
- **功能**: 查看、编辑、禁用用户

#### `Projects.tsx`
- **作用**: 项目管理页
- **功能**: 审核、发布、关闭项目

#### `Settings.tsx`
- **作用**: 系统设置页
- **功能**: 系统配置、参数设置

---

## 🔧 工具目录 (`lib/`)

### `trpc.ts`
- **作用**: tRPC 客户端配置
- **功能**: 创建类型安全的 API 客户端
- **代码**:
```typescript
export const trpc = createTRPCReact<AppRouter>();
```

### `utils.ts`
- **作用**: 工具函数
- **功能**: 通用工具函数（如 `cn()` 用于合并 className）

---

## 🎣 Hooks 目录 (`hooks/`)

### `useMobile.tsx`
- **作用**: 检测移动设备
- **功能**: 判断当前是否为移动端

### `usePersistFn.ts`
- **作用**: 持久化函数引用
- **功能**: 保持函数引用不变，避免不必要的重渲染

### `useComposition.ts`
- **作用**: 输入法组合事件处理
- **功能**: 处理中文输入法输入

---

## 🌐 Contexts 目录 (`contexts/`)

### `ThemeContext.tsx`
- **作用**: 主题上下文
- **功能**: 
  - 管理深色/浅色主题
  - 提供主题切换功能
  - 持久化主题设置

---

## 🔗 Shared 目录 (`shared/`)

### `hooks/useAuth.ts`
- **作用**: 认证 Hook
- **功能**: 
  - 获取当前用户信息
  - 检查登录状态
  - 处理登录/登出

---

## 📊 数据流

```
用户操作
  ↓
页面组件 (pages/)
  ↓
调用 tRPC Hook (trpc.xxx.useQuery/useMutation)
  ↓
tRPC 客户端 (lib/trpc.ts)
  ↓
HTTP 请求 (/api/trpc)
  ↓
后端服务器
```

---

## 🎨 样式系统

### Tailwind CSS 4
- **作用**: 原子化 CSS 框架
- **特点**: 
  - 实用类优先
  - 响应式设计
  - 深色模式支持

### shadcn/ui
- **作用**: 基于 Radix UI 的组件库
- **特点**: 
  - 可复制粘贴的组件代码
  - 完全可定制
  - 类型安全

---

## 🔐 权限控制

### 路由级权限
- `ProtectedRoute`: 需要登录才能访问
- 角色检查: 根据用户角色显示不同页面

### 组件级权限
- 使用 `useAuth()` Hook 获取用户信息
- 根据角色条件渲染不同内容

---

## 📦 构建流程

```bash
pnpm build
  ↓
Vite 构建前端
  ↓
输出到 dist/public/
  ↓
包含: HTML, JS, CSS, 静态资源
```

---

## 🚀 开发流程

```bash
pnpm dev
  ↓
Vite 开发服务器
  ↓
热模块替换 (HMR)
  ↓
实时预览更改
```

---

## 📝 总结

**Client 文件夹的核心职责**:
1. ✅ **用户界面**: 所有前端页面和组件
2. ✅ **状态管理**: React Context + React Query
3. ✅ **API 调用**: tRPC 类型安全的 API 调用
4. ✅ **路由管理**: Wouter 路由配置
5. ✅ **样式系统**: Tailwind CSS + shadcn/ui
6. ✅ **权限控制**: 基于角色的访问控制

**技术栈**:
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- tRPC Client
- React Query
- Wouter

---

*最后更新: 2024年*

