# 配置文件整理总结

## ✅ 已完成的整理

### 配置文件移动

- ✅ `drizzle.config.ts` → `config/drizzle.config.ts`
  - 已更新 `package.json` 中的 `db:push` 脚本，添加 `--config` 参数

- ✅ `ecosystem.config.cjs` → `config/ecosystem.config.cjs`
  - 已更新 `cwd` 路径为 `path.resolve(__dirname, "..")`
  - 已更新 `scripts/start.sh` 中的引用
  - 已更新 `scripts/deploy.sh` 中的创建路径

- ✅ `vitest.config.ts` → `config/vitest.config.ts`
  - 已更新路径引用（使用 `import.meta.dirname`）
  - 已更新 `package.json` 中的 `test` 脚本，添加 `--config` 参数

- ✅ `env.example` → `config/env.example`
  - 环境变量示例文件，已移动到配置目录

## 📂 当前配置文件位置

### 根目录配置文件（保留）
- `package.json` - 项目配置
- `tsconfig.json` - TypeScript 配置（工具默认在根目录查找）
- `vite.config.ts` - Vite 配置（工具默认在根目录查找）
- `components.json` - shadcn/ui 配置（工具默认在根目录查找）
- `install.sh` - pnpm 安装脚本（部署脚本引用）

### config/ 目录
- `drizzle.config.ts` - Drizzle ORM 配置
- `ecosystem.config.cjs` - PM2 进程管理配置
- `vitest.config.ts` - Vitest 测试配置
- `env.example` - 环境变量示例

## 🔧 使用说明

### 数据库迁移命令

由于配置文件已移动到 `config/` 目录，`package.json` 中的脚本已更新：

```json
"db:push": "drizzle-kit generate --config=./config/drizzle.config.ts && drizzle-kit migrate --config=./config/drizzle.config.ts"
```

### 测试命令

```json
"test": "vitest run --config=./config/vitest.config.ts"
```

### PM2 命令

#### 手动启动
```bash
pm2 start config/ecosystem.config.cjs
```

#### 使用脚本
```bash
# 启动
./scripts/start.sh

# 停止
./scripts/stop.sh
```

脚本会自动查找 `config/ecosystem.config.cjs` 或根目录的旧配置文件（向后兼容）。

### 手动运行 Drizzle 命令

如果需要手动运行 Drizzle Kit 命令，请使用 `--config` 参数：

```bash
# 生成迁移
drizzle-kit generate --config=./config/drizzle.config.ts

# 执行迁移
drizzle-kit migrate --config=./config/drizzle.config.ts

# 查看数据库
drizzle-kit studio --config=./config/drizzle.config.ts
```

## 📝 注意事项

- **Drizzle Kit**: 默认在根目录查找 `drizzle.config.ts`，移动后需要在所有命令中指定 `--config` 参数
- **PM2**: 支持通过路径指定配置文件，`cwd` 已更新为相对于配置文件的位置
- **Vitest**: 支持通过 `--config` 参数指定配置文件
- **Vite/TypeScript**: 这些工具的配置文件通常保留在根目录，因为工具默认在根目录查找
- **向后兼容**: `scripts/start.sh` 会优先查找 `config/` 目录，如果不存在则查找根目录（向后兼容）

## 🔄 已更新的文件

- `package.json` - 更新了 `db:push` 和 `test` 脚本
- `scripts/start.sh` - 更新了 PM2 配置文件路径
- `scripts/deploy.sh` - 更新了 PM2 配置文件创建路径和启动命令
