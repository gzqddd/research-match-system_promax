# 项目架构重构计划

## 📋 当前问题分析

### 1. Server 目录结构混乱
- ❌ `server/_core/` 中框架核心和业务逻辑混在一起
- ❌ `server/` 根目录文件过多（routers.ts, db.ts, ai-match.ts 等）
- ❌ 缺少清晰的分层（routes, services, repositories）
- ❌ 测试文件散落在根目录

### 2. Client 目录可以优化
- ⚠️ `_core/` 目录只有一个 hooks，可以整合
- ⚠️ `components/` 可以按功能分类
- ⚠️ 缺少 `utils/` 目录

### 3. 文档分散
- ⚠️ 多个 markdown 文件在根目录，应该整理到 `docs/`

### 4. 其他问题
- ⚠️ `llm-council-master/` 应该移到合适位置或独立管理
- ⚠️ 日志文件过多，应该配置日志轮转

---

## 🎯 目标架构

### 理想的后端结构
```
server/
├── core/                    # 框架核心（不可修改）
│   ├── config/             # 配置管理（已完成）
│   ├── framework/          # 框架相关
│   │   ├── express.ts      # Express 配置
│   │   ├── trpc.ts         # tRPC 配置
│   │   └── context.ts      # 上下文
│   ├── middleware/         # 中间件
│   │   ├── auth.ts         # 认证中间件
│   │   └── cookies.ts      # Cookie 处理
│   └── utils/              # 工具函数
│       ├── logger.ts
│       └── validators.ts
├── routes/                  # 路由定义
│   ├── index.ts            # 主路由（原 routers.ts）
│   ├── auth.ts             # 认证路由
│   ├── student.ts          # 学生相关路由
│   ├── teacher.ts          # 教师相关路由
│   └── admin.ts            # 管理员路由
├── services/                # 业务服务层
│   ├── ai/                 # AI 服务
│   │   ├── match.ts        # 匹配服务
│   │   ├── chat.ts         # 对话服务
│   │   └── llm.ts          # LLM 调用
│   ├── storage/            # 存储服务
│   │   ├── local.ts
│   │   └── s3.ts
│   ├── notification.ts     # 通知服务
│   └── map.ts              # 地图服务
├── repositories/            # 数据访问层
│   ├── index.ts            # 主入口（原 db.ts）
│   ├── user.repository.ts
│   ├── project.repository.ts
│   ├── application.repository.ts
│   └── ...
├── types/                   # 类型定义
│   └── ...
└── tests/                   # 测试文件
    ├── unit/
    └── integration/
```

### 理想的前端结构
```
client/src/
├── app/                     # 应用入口
│   ├── App.tsx             # 路由配置
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── features/               # 功能模块（按业务划分）
│   ├── auth/               # 认证功能
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   ├── student/            # 学生端功能
│   │   ├── dashboard/
│   │   ├── projects/
│   │   └── applications/
│   ├── teacher/            # 教师端功能
│   └── admin/              # 管理员功能
├── shared/                 # 共享代码
│   ├── components/         # 通用组件
│   │   ├── ui/            # UI 组件库
│   │   └── layout/        # 布局组件
│   ├── hooks/             # 共享 Hooks
│   ├── lib/               # 工具库
│   │   ├── trpc.ts
│   │   └── utils.ts
│   ├── contexts/          # React Context
│   └── constants/         # 常量
└── types/                  # 类型定义
```

---

## 📝 重构 TODO 清单

### 阶段 1: 后端核心重构（优先级：高）

#### 1.1 整理 server/_core 目录
- [ ] 创建 `server/core/framework/` 目录
  - [ ] 移动 `trpc.ts` → `framework/trpc.ts`
  - [ ] 移动 `context.ts` → `framework/context.ts`
  - [ ] 移动 `index.ts` → `framework/express.ts`（重命名）
- [ ] 创建 `server/core/middleware/` 目录
  - [ ] 移动 `cookies.ts` → `middleware/cookies.ts`
  - [ ] 移动 `local-auth.ts` → `middleware/auth.ts`（重命名并重构）
- [ ] 创建 `server/core/utils/` 目录
  - [ ] 移动 `vite.ts` → `utils/vite.ts`
  - [ ] 移动 `dataApi.ts` → `utils/data-api.ts`（如果只是工具函数）
- [ ] 创建 `server/core/services/` 目录（临时存放，后续移到主 services）
  - [ ] 移动 `llm.ts` → `services/ai/llm.ts`
  - [ ] 移动 `imageGeneration.ts` → `services/ai/image-generation.ts`
  - [ ] 移动 `voiceTranscription.ts` → `services/ai/voice-transcription.ts`
  - [ ] 移动 `map.ts` → `services/map.ts`
  - [ ] 移动 `notification.ts` → `services/notification.ts`
- [ ] 删除或标记废弃的文件
  - [ ] `env.ts`（已由 config 替代，保留兼容层）
  - [ ] `oauth.ts`（如果不再使用）
  - [ ] `sdk.ts`（如果不再使用）
  - [ ] `systemRouter.ts`（移到 routes/）

#### 1.2 创建清晰的分层结构
- [ ] 创建 `server/routes/` 目录
  - [ ] 拆分 `routers.ts` → `routes/index.ts` + `routes/auth.ts` + `routes/student.ts` + `routes/teacher.ts` + `routes/admin.ts`
- [ ] 创建 `server/services/` 目录
  - [ ] 移动 `ai-match.ts` → `services/ai/match.ts`
  - [ ] 移动 `ai-match-local.ts` → `services/ai/match-local.ts`
  - [ ] 移动 `storage.ts` → `services/storage/s3.ts`
  - [ ] 移动 `storage-local.ts` → `services/storage/local.ts`
- [ ] 创建 `server/repositories/` 目录
  - [ ] 重构 `db.ts` → `repositories/index.ts` + 按实体拆分（user.repository.ts, project.repository.ts 等）

#### 1.3 整理测试文件
- [ ] 创建 `server/tests/` 目录
  - [ ] 移动 `*.test.ts` → `tests/unit/`
  - [ ] 创建 `tests/integration/` 目录

### 阶段 2: 前端结构优化（优先级：中）

#### 2.1 整合 _core 目录
- [ ] 移动 `client/src/_core/hooks/useAuth.ts` → `client/src/shared/hooks/useAuth.ts`
- [ ] 删除 `client/src/_core/` 目录

#### 2.2 按功能模块重组
- [ ] 创建 `client/src/features/` 目录结构
  - [ ] 创建 `features/auth/`（登录、注册相关）
  - [ ] 创建 `features/student/`（学生端所有功能）
  - [ ] 创建 `features/teacher/`（教师端所有功能）
  - [ ] 创建 `features/admin/`（管理员功能）
- [ ] 移动页面文件到对应 features
  - [ ] `pages/student/*` → `features/student/pages/`
  - [ ] `pages/teacher/*` → `features/teacher/pages/`
  - [ ] `pages/admin/*` → `features/admin/pages/`
- [ ] 移动相关组件到对应 features
  - [ ] 学生端专用组件 → `features/student/components/`
  - [ ] 教师端专用组件 → `features/teacher/components/`

#### 2.3 整理共享代码
- [ ] 创建 `client/src/shared/` 目录
  - [ ] 移动 `components/ui/` → `shared/components/ui/`
  - [ ] 移动 `components/SystemLayout.tsx` → `shared/components/layout/SystemLayout.tsx`
  - [ ] 移动 `components/DashboardLayout.tsx` → `shared/components/layout/DashboardLayout.tsx`
  - [ ] 移动 `components/ProjectCard.tsx` → `shared/components/ProjectCard.tsx`（如果是共享组件）
  - [ ] 移动 `hooks/` → `shared/hooks/`
  - [ ] 移动 `lib/` → `shared/lib/`
  - [ ] 移动 `contexts/` → `shared/contexts/`
  - [ ] 移动 `const.ts` → `shared/constants/index.ts`

### 阶段 3: 文档和配置整理（优先级：低）

#### 3.1 整理文档
- [ ] 创建 `docs/` 目录结构
  - [ ] `docs/development/` - 开发文档
  - [ ] `docs/deployment/` - 部署文档
  - [ ] `docs/api/` - API 文档
- [ ] 移动文档文件
  - [ ] `DEPLOYMENT.md` → `docs/deployment/DEPLOYMENT.md`
  - [ ] `QUICK_DEPLOY.md` → `docs/deployment/QUICK_DEPLOY.md`
  - [ ] `DEPLOY_SUMMARY.md` → `docs/deployment/DEPLOY_SUMMARY.md`
  - [ ] `ENV_CHECKLIST.md` → `docs/development/ENV_CHECKLIST.md`
  - [ ] `PROJECT_STRUCTURE_ANALYSIS.md` → `docs/development/STRUCTURE.md`
  - [ ] `CLEANUP_SUMMARY.md` → `docs/development/CLEANUP.md`
- [ ] 创建 `docs/README.md` 作为文档索引

#### 3.2 整理其他文件
- [ ] 处理 `llm-council-master/` 目录
  - [ ] 如果作为子项目，移到 `external/llm-council/`
  - [ ] 或者独立管理，从主项目移除
- [ ] 配置日志轮转，避免 `logs/` 目录文件过多
- [ ] 清理 `__dummy__` 文件（如果存在）

### 阶段 4: 代码质量提升（优先级：中）

#### 4.1 统一导入路径
- [ ] 更新所有导入路径以匹配新结构
- [ ] 使用路径别名（如 `@/server/core`, `@/client/shared`）
- [ ] 更新 `tsconfig.json` 的 paths 配置

#### 4.2 代码规范
- [ ] 统一文件命名规范（kebab-case vs camelCase）
- [ ] 统一导出方式（named export vs default export）
- [ ] 添加缺失的类型定义

#### 4.3 测试覆盖
- [ ] 为新的 services 添加单元测试
- [ ] 为新的 repositories 添加测试
- [ ] 添加集成测试

---

## 🚀 执行建议

### 推荐执行顺序

1. **先做后端核心重构**（影响最大，但收益最高）
   - 从 `server/_core` 整理开始
   - 然后创建分层结构
   - 最后整理测试文件

2. **再做前端优化**（相对独立，风险较小）
   - 先整合 `_core` 目录
   - 再按功能模块重组

3. **最后整理文档**（不影响代码运行）

### 注意事项

- ⚠️ **逐步重构**：不要一次性改动太多，分阶段进行
- ⚠️ **保持兼容**：重构时保留旧接口的兼容层
- ⚠️ **充分测试**：每个阶段完成后都要测试
- ⚠️ **更新文档**：及时更新 README 和代码注释

---

## 📊 预期收益

1. ✅ **代码可维护性提升**：清晰的分层和模块划分
2. ✅ **开发效率提升**：更容易找到和修改代码
3. ✅ **团队协作改善**：统一的代码组织方式
4. ✅ **新人上手更快**：清晰的目录结构
5. ✅ **扩展性更好**：易于添加新功能

---

**最后更新**: 2025-12-17
**状态**: 待执行

