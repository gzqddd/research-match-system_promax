# 根目录文件整理总结

## ✅ 已完成的整理

### 1. 文档文件整理

所有 Markdown 文档已移动到 `docs/` 目录：

#### 部署文档 (`docs/deployment/`)
- `DEPLOYMENT.md` - 完整部署指南
- `QUICK_DEPLOY.md` - 快速部署指南
- `DEPLOY_SUMMARY.md` - 部署总结

#### 开发文档 (`docs/development/`)
- `ENV_CHECKLIST.md` - 环境变量检查清单
- `STRUCTURE.md` - 项目结构分析（原 PROJECT_STRUCTURE_ANALYSIS.md）
- `todo.md` - 项目待办事项

#### 重构文档 (`docs/refactoring/`)
- `REFACTOR_PLAN.md` - 重构计划
- `REFACTOR_COMPLETE.md` - 重构完成总结
- `REFACTOR_SUMMARY.md` - 重构总结
- `CLEANUP.md` - 清理总结（原 CLEANUP_SUMMARY.md）
- `CLEANUP_FINAL.md` - 最终清理总结

#### 文档索引
- `docs/README.md` - 文档索引和导航

### 2. 配置文件整理

- ✅ 保留 `ecosystem.config.cjs` - PM2 配置文件（完整版本）
- ✅ 删除 `ecosystem.config.js` - 旧版本配置文件

### 3. 其他文件清理

- ✅ 删除 `__dummy__` - 临时文件

### 4. README 更新

- ✅ 更新 `README.md`，添加指向 `docs/` 的链接

## 📂 当前根目录结构

```
research-match-system/
├── README.md                 # 项目主文档（已更新链接）
├── package.json              # 项目配置
├── pnpm-lock.yaml           # 依赖锁定文件
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
├── vitest.config.ts         # Vitest 配置
├── drizzle.config.ts        # Drizzle 配置
├── components.json          # shadcn/ui 配置
├── ecosystem.config.cjs     # PM2 配置（保留）
├── env.example              # 环境变量示例
├── install.sh               # 安装脚本
├── docs/                    # 📚 文档目录（新）
│   ├── README.md            # 文档索引
│   ├── deployment/          # 部署文档
│   ├── development/         # 开发文档
│   └── refactoring/         # 重构文档
├── client/                   # 前端代码
├── server/                   # 后端代码
├── shared/                   # 共享代码
├── drizzle/                 # 数据库相关
├── scripts/                 # 脚本文件
├── patches/                 # 补丁文件
├── llm-council-master/      # 外部项目（待处理）
└── logs/                    # 日志文件
```

## 📝 文件说明

### 配置文件
- `package.json` - 项目依赖和脚本
- `tsconfig.json` - TypeScript 编译配置
- `vite.config.ts` - Vite 构建配置
- `vitest.config.ts` - 测试配置
- `drizzle.config.ts` - 数据库 ORM 配置
- `components.json` - shadcn/ui 组件配置
- `ecosystem.config.cjs` - PM2 进程管理配置
- `env.example` - 环境变量模板

### 脚本文件
- `install.sh` - 安装脚本
- `scripts/` - 其他脚本文件

### 文档
- `README.md` - 项目主文档
- `docs/` - 所有详细文档

## 🎯 整理效果

- ✅ 根目录更清晰，只保留必要的配置文件
- ✅ 所有文档集中在 `docs/` 目录，便于查找
- ✅ 文档分类明确（部署/开发/重构）
- ✅ 删除了重复和临时文件

## 📌 后续建议

1. **处理 `llm-council-master/` 目录**
   - 如果不再使用，可以删除
   - 如果需要保留，可以移动到 `external/llm-council/`

2. **配置日志轮转**
   - 在 `ecosystem.config.cjs` 中添加日志轮转配置
   - 避免 `logs/` 目录文件过多

3. **更新 `.gitignore`**
   - 确保 `logs/` 和 `dist/` 等目录被忽略

