# Client/src 目录详细说明

## 📁 目录结构概览

```
src/
├── main.tsx              # 🚀 应用入口文件
├── App.tsx               # 🗺️ 路由配置和主应用组件
├── index.css             # 🎨 全局样式文件
├── const.ts              # 📋 前端常量定义
├── components/           # 🧩 组件目录
│   ├── ui/              # UI基础组件库（60+组件）
│   └── [业务组件]       # 业务逻辑组件
├── pages/                # 📄 页面组件目录
│   ├── student/         # 学生端页面
│   ├── teacher/         # 教师端页面
│   └── admin/           # 管理员端页面
├── lib/                  # 🔧 工具库
├── hooks/                # 🎣 自定义 Hooks
├── contexts/             # 🌐 React Context（全局状态）
└── shared/               # 🔗 共享代码
```

---

## 🚀 核心文件详解

### 1. `main.tsx` - 应用入口

**作用**: React 应用的启动入口，初始化所有全局配置

**主要功能**:

#### 1.1 创建 tRPC 客户端
```typescript
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",        // 后端 API 地址
      transformer: superjson,  // 数据序列化（支持 Date、Map 等）
      credentials: "include",  // 包含 Cookie（用于认证）
    }),
  ],
});
```

**说明**:
- `httpBatchLink`: 批量请求优化，多个 API 调用合并为一个 HTTP 请求
- `superjson`: 支持复杂数据类型（Date、Map、Set 等）的序列化
- `credentials: "include"`: 自动携带 Cookie，用于身份认证

#### 1.2 创建 React Query 客户端
```typescript
const queryClient = new QueryClient();
```

**作用**: 管理所有 API 查询的缓存和状态

#### 1.3 错误处理
```typescript
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);  // 未授权自动跳转登录
  }
});
```

**功能**: 
- 监听所有 API 错误
- 如果是未授权错误（401），自动跳转到登录页

#### 1.4 渲染应用
```typescript
createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
```

**说明**:
- `trpc.Provider`: 提供 tRPC 客户端给所有子组件
- `QueryClientProvider`: 提供 React Query 客户端
- `<App />`: 主应用组件

---

### 2. `App.tsx` - 路由配置

**作用**: 定义所有页面路由、权限控制和应用结构

#### 2.1 应用结构
```typescript
function App() {
  return (
    <ErrorBoundary>           {/* 错误边界，捕获渲染错误 */}
      <ThemeProvider>          {/* 主题提供者（深色/浅色模式） */}
        <TooltipProvider>      {/* 工具提示提供者 */}
          <Toaster />          {/* Toast 通知组件 */}
          <Router />            {/* 路由组件 */}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

**组件说明**:
- `ErrorBoundary`: 捕获子组件错误，显示友好错误页面
- `ThemeProvider`: 管理主题（深色/浅色）
- `TooltipProvider`: 提供工具提示功能
- `Toaster`: 全局 Toast 通知（成功、错误提示）

#### 2.2 路由定义

**公共路由**:
```typescript
<Route path="/login" component={Login} />
<Route path="/role-select">
  {() => <ProtectedRoute component={RoleSelect} />}
</Route>
```

**学生端路由**:
```typescript
<Route path="/dashboard">
  {() => <ProtectedRoute component={StudentDashboard} allowedRoles={["student"]} />}
</Route>
<Route path="/projects/:id">
  {() => <ProtectedRoute component={ProjectDetail} allowedRoles={["student"]} />}
</Route>
// ... 更多学生端路由
```

**教师端路由**:
```typescript
<Route path="/teacher/dashboard">
  {() => <ProtectedRoute component={TeacherDashboard} allowedRoles={["teacher"]} />}
</Route>
// ... 更多教师端路由
```

**管理员端路由**:
```typescript
<Route path="/admin/dashboard">
  {() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
</Route>
// ... 更多管理员端路由
```

#### 2.3 权限控制组件

```typescript
function ProtectedRoute({ component: Component, allowedRoles }) {
  const { user, loading } = useAuth();

  // 加载中显示加载动画
  if (loading) return <LoadingSpinner />;

  // 未登录跳转到登录页
  if (!user) return <Redirect to="/login" />;

  // 角色不匹配跳转到角色选择页
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/role-select" />;
  }

  // 权限通过，渲染组件
  return <Component />;
}
```

**功能**:
- ✅ 检查登录状态
- ✅ 检查用户角色
- ✅ 自动重定向

---

### 3. `index.css` - 全局样式

**作用**: 全局 CSS 样式和 Tailwind CSS 配置

**内容**:
- Tailwind CSS 指令（`@tailwind base/components/utilities`）
- 全局样式重置
- 自定义 CSS 变量（颜色、字体等）
- 深色模式样式

---

### 4. `const.ts` - 常量定义

**作用**: 前端使用的常量

**内容**:
```typescript
export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// 生成登录 URL
export const getLoginUrl = () => {
  return `${window.location.origin}/login`;
};
```

**说明**:
- 从 `shared/const.ts` 导入共享常量
- 提供登录 URL 生成函数

---

## 🧩 Components 目录详解

### 业务组件

#### `SystemLayout.tsx`
- **作用**: 系统主布局
- **功能**: 
  - 侧边栏导航
  - 顶部导航栏
  - AI 助手按钮
  - 用户信息显示

#### `DashboardLayout.tsx`
- **作用**: 仪表板布局
- **功能**: 为各个 Dashboard 页面提供统一布局结构

#### `AIAssistantDrawer.tsx`
- **作用**: AI 助手抽屉组件
- **功能**: 
  - 全局 AI 对话界面
  - 支持三端不同场景（学生/教师/管理员）
  - Markdown 渲染
  - 消息历史记录

#### `AIChatBox.tsx`
- **作用**: AI 聊天框组件
- **功能**: 
  - 消息列表显示
  - 输入框和发送按钮
  - 加载状态显示
  - 自动滚动到底部

#### `ProjectCard.tsx`
- **作用**: 项目卡片组件
- **功能**: 展示项目信息的卡片式布局

#### `ErrorBoundary.tsx`
- **作用**: 错误边界组件
- **功能**: 捕获子组件错误，显示友好错误页面

### UI 组件库 (`components/ui/`)

**作用**: 基于 **shadcn/ui** 的基础 UI 组件库

**组件分类**:

1. **表单组件**
   - `button.tsx` - 按钮
   - `input.tsx` - 输入框
   - `textarea.tsx` - 文本域
   - `select.tsx` - 下拉选择
   - `checkbox.tsx` - 复选框
   - `radio-group.tsx` - 单选组
   - `switch.tsx` - 开关
   - `form.tsx` - 表单容器

2. **布局组件**
   - `card.tsx` - 卡片
   - `sheet.tsx` - 侧边栏
   - `dialog.tsx` - 对话框
   - `drawer.tsx` - 抽屉
   - `sidebar.tsx` - 侧边栏
   - `separator.tsx` - 分隔线

3. **反馈组件**
   - `alert.tsx` - 警告提示
   - `alert-dialog.tsx` - 确认对话框
   - `sonner.tsx` - Toast 通知
   - `progress.tsx` - 进度条
   - `skeleton.tsx` - 骨架屏
   - `spinner.tsx` - 加载动画

4. **导航组件**
   - `tabs.tsx` - 标签页
   - `breadcrumb.tsx` - 面包屑
   - `navigation-menu.tsx` - 导航菜单
   - `menubar.tsx` - 菜单栏

5. **数据展示**
   - `table.tsx` - 表格
   - `chart.tsx` - 图表
   - `badge.tsx` - 徽章
   - `avatar.tsx` - 头像

6. **其他**
   - `tooltip.tsx` - 工具提示
   - `popover.tsx` - 弹出框
   - `dropdown-menu.tsx` - 下拉菜单
   - `accordion.tsx` - 手风琴
   - `calendar.tsx` - 日历
   - `slider.tsx` - 滑块

**特点**:
- ✅ 完全类型安全（TypeScript）
- ✅ 可访问性支持（ARIA）
- ✅ 深色模式支持
- ✅ 高度可定制
- ✅ 基于 Radix UI（无样式组件）

---

## 📄 Pages 目录详解

### 公共页面

#### `Login.tsx`
- **路由**: `/login`
- **功能**: 用户登录（邮箱+密码）

#### `RoleSelect.tsx`
- **路由**: `/role-select`
- **功能**: 登录后选择角色（学生/教师/管理员）

#### `Home.tsx`
- **路由**: `/`
- **功能**: 首页，根据登录状态重定向

#### `NotFound.tsx`
- **路由**: `/*` (404)
- **功能**: 页面不存在时显示

#### `Settings.tsx`
- **路由**: `/settings`
- **功能**: 通用设置页面

### 学生端页面 (`pages/student/`)

#### `Dashboard.tsx`
- **路由**: `/dashboard`
- **功能**: 
  - 显示推荐项目
  - 申请状态统计
  - 快速操作入口

#### `Projects.tsx`
- **路由**: `/projects`
- **功能**: 浏览所有可申请的项目列表

#### `ProjectDetail.tsx`
- **路由**: `/projects/:id`
- **功能**: 
  - 查看项目详细信息
  - Markdown 渲染项目描述
  - 申请按钮

#### `ProjectApply.tsx`
- **路由**: `/projects/:id/apply`
- **功能**: 
  - 填写申请表单
  - AI 生成申请陈述
  - 提交申请

#### `MyApplications.tsx`
- **路由**: `/my-applications`
- **功能**: 查看所有已提交的申请列表

#### `ApplicationDetail.tsx`
- **路由**: `/applications/:id`
- **功能**: 
  - 查看申请详情
  - 教师反馈
  - 匹配分析（Markdown 渲染）

#### `Profile.tsx`
- **路由**: `/profile`
- **功能**: 
  - 编辑个人信息
  - 上传简历（PDF 自动解析）
  - 管理项目链接（GitHub 等）

### 教师端页面 (`pages/teacher/`)

#### `Dashboard.tsx`
- **路由**: `/teacher/dashboard`
- **功能**: 
  - 项目统计
  - 申请数量
  - 数据图表

#### `Projects.tsx`
- **路由**: `/teacher/projects`
- **功能**: 管理自己发布的项目

#### `ProjectNew.tsx`
- **路由**: `/teacher/projects/new`
- **功能**: 
  - 创建新项目
  - AI 扩展项目描述

#### `ProjectApplications.tsx`
- **路由**: `/teacher/projects/:id/applications`
- **功能**: 
  - 查看某个项目的所有申请
  - AI 分析最匹配申请人

#### `Applications.tsx`
- **路由**: `/teacher/applications`
- **功能**: 
  - 查看所有项目的申请
  - 筛选、审核申请
  - 查看学生简历

#### `Internships.tsx`
- **路由**: `/teacher/internships`
- **功能**: 
  - 管理学生实习进度
  - 查看周报
  - 添加教师反馈

### 管理员端页面 (`pages/admin/`)

#### `Dashboard.tsx`
- **路由**: `/admin/dashboard`
- **功能**: 系统整体数据统计、监控大屏

#### `Users.tsx`
- **路由**: `/admin/users`
- **功能**: 查看、编辑、禁用用户

#### `Projects.tsx`
- **路由**: `/admin/projects`
- **功能**: 审核、发布、关闭项目

#### `Settings.tsx`
- **路由**: `/admin/settings`
- **功能**: 系统配置、参数设置

---

## 🔧 Lib 目录详解

### `lib/trpc.ts`
**作用**: tRPC 客户端配置

**代码**:
```typescript
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routes";

export const trpc = createTRPCReact<AppRouter>();
```

**说明**:
- `createTRPCReact`: 创建 React 版本的 tRPC 客户端
- `AppRouter`: 从后端导入的类型定义，确保类型安全
- 使用: `trpc.student.profile.get.useQuery()` - 自动获得类型提示

### `lib/utils.ts`
**作用**: 工具函数

**代码**:
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**功能**: 
- `cn()`: 合并 className，处理 Tailwind CSS 类名冲突
- 使用: `cn("text-red-500", isActive && "font-bold")`

---

## 🎣 Hooks 目录详解

### `hooks/useMobile.tsx`
**作用**: 检测移动设备

**功能**: 判断当前是否为移动端，用于响应式设计

### `hooks/usePersistFn.ts`
**作用**: 持久化函数引用

**功能**: 保持函数引用不变，避免不必要的重渲染

**使用场景**: 
- 传递给子组件的回调函数
- 防止子组件不必要的重新渲染

### `hooks/useComposition.ts`
**作用**: 输入法组合事件处理

**功能**: 处理中文输入法输入，避免在输入过程中触发事件

**使用场景**: 
- 搜索框输入
- 表单输入验证

---

## 🌐 Contexts 目录详解

### `contexts/ThemeContext.tsx`
**作用**: 主题管理（深色/浅色模式）

**功能**:

#### 1. 主题状态管理
```typescript
const [theme, setTheme] = useState<Theme>(() => {
  const stored = localStorage.getItem("theme");
  return (stored as Theme) || defaultTheme;
});
```

#### 2. 应用主题到 DOM
```typescript
useEffect(() => {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
}, [theme]);
```

#### 3. 切换主题函数
```typescript
const toggleTheme = () => {
  setTheme(prev => (prev === "light" ? "dark" : "light"));
};
```

#### 4. 使用主题
```typescript
const { theme, toggleTheme } = useTheme();
```

**说明**:
- 主题保存在 `localStorage`，刷新后保持
- 通过添加 `dark` class 到 `<html>` 元素切换主题
- Tailwind CSS 自动应用深色模式样式

---

## 🔗 Shared 目录详解

### `shared/hooks/useAuth.ts`
**作用**: 认证 Hook

**功能**:

#### 1. 获取用户信息
```typescript
const meQuery = trpc.auth.me.useQuery(undefined, {
  retry: false,
  refetchOnWindowFocus: false,
});
```

#### 2. 登出功能
```typescript
const logoutMutation = trpc.auth.logout.useMutation({
  onSuccess: () => {
    utils.auth.me.setData(undefined, null);
  },
});
```

#### 3. 返回状态
```typescript
return {
  user: meQuery.data ?? null,        // 当前用户信息
  loading: meQuery.isLoading,         // 加载状态
  error: meQuery.error,               // 错误信息
  isAuthenticated: Boolean(meQuery.data), // 是否已登录
  refresh: () => meQuery.refetch(),   // 刷新用户信息
  logout,                              // 登出函数
};
```

#### 4. 持久化用户信息
```typescript
if (meQuery.data) {
  localStorage.setItem(
    "research-match-user-info",
    JSON.stringify(meQuery.data)
  );
}
```

**使用示例**:
```typescript
const { user, loading, isAuthenticated, logout } = useAuth();

if (loading) return <Loading />;
if (!isAuthenticated) return <Login />;
```

---

## 📊 数据流

### API 调用流程

```
页面组件 (pages/)
  ↓
调用 tRPC Hook
  trpc.student.profile.get.useQuery()
  ↓
tRPC 客户端 (lib/trpc.ts)
  ↓
HTTP 请求 (/api/trpc)
  ↓
后端服务器 (server/routes/)
  ↓
返回数据
  ↓
React Query 缓存
  ↓
更新组件状态
  ↓
重新渲染
```

### 状态管理流程

```
全局状态 (Contexts)
  ThemeContext → 主题
  ↓
组件使用
  const { theme } = useTheme();
  ↓
应用状态
  React Query → API 数据缓存
  ↓
本地状态
  useState → 组件内部状态
```

---

## 🎯 关键设计模式

### 1. 组件化
- 每个功能拆分成独立组件
- 组件可复用、易维护

### 2. 类型安全
- TypeScript 类型检查
- tRPC 端到端类型安全

### 3. 权限控制
- 路由级权限（ProtectedRoute）
- 组件级权限（useAuth）

### 4. 错误处理
- ErrorBoundary 捕获渲染错误
- tRPC 错误自动处理

### 5. 状态管理
- React Query 管理服务器状态
- Context 管理全局状态
- useState 管理本地状态

---

## 📝 总结

**src 目录的核心职责**:

1. ✅ **应用启动**: `main.tsx` 初始化所有配置
2. ✅ **路由管理**: `App.tsx` 定义所有路由和权限
3. ✅ **组件库**: `components/` 提供可复用的 UI 组件
4. ✅ **页面**: `pages/` 实现所有业务页面
5. ✅ **工具库**: `lib/` 提供工具函数和 API 客户端
6. ✅ **状态管理**: `contexts/` 和 `hooks/` 管理全局状态
7. ✅ **共享代码**: `shared/` 提供跨模块共享的功能

**技术特点**:
- 🎯 类型安全（TypeScript + tRPC）
- 🎨 现代化 UI（Tailwind CSS + shadcn/ui）
- 🔐 完善的权限控制
- 🚀 高性能（React Query 缓存）
- 📱 响应式设计

---

*最后更新: 2024年*

