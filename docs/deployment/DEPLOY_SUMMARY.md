# 一键部署方案总结

本文档总结了智研匹配系统的完整一键部署方案。

---

## 📦 部署方案概览

### 核心脚本

| 脚本 | 位置 | 功能 | 使用场景 |
|------|------|------|---------|
| `deploy.sh` | `scripts/deploy.sh` | 完整部署 | 首次部署或完整重新部署 |
| `start.sh` | `scripts/start.sh` | 启动应用 | 应用停止后重新启动 |
| `stop.sh` | `scripts/stop.sh` | 停止应用 | 需要停止应用进行维护 |

### 配置文件

| 文件 | 位置 | 说明 |
|------|------|------|
| 配置模板 | `env.example` | 环境变量配置模板 |
| 实际配置 | `.env.production` | 实际的环境变量配置 (需自己创建) |
| 部署指南 | `QUICK_DEPLOY.md` | 快速部署指南 |

---

## 🚀 三种部署方式

### 方式1: 完全自动部署 (推荐)

**适用于**: 首次部署或完整重新部署

```bash
# 1. 克隆项目
git clone <your-repository-url> /opt/research-match-system
cd /opt/research-match-system

# 2. 创建配置
cp env.example .env.production
nano .env.production  # 填入实际配置

# 3. 一键部署
./scripts/deploy.sh --production
```

**脚本会自动完成**:
- ✅ 环境检查 (OS、依赖等)
- ✅ 系统初始化 (安装Node.js、MySQL、Nginx等)
- ✅ 环境配置 (复制配置文件、验证变量)
- ✅ 数据库初始化 (创建数据库、运行迁移)
- ✅ 应用构建 (npm install、npm build)
- ✅ 服务启动 (PM2、Nginx)
- ✅ 部署验证 (健康检查)

**耗时**: 约 10-15 分钟 (取决于网络和硬件)

### 方式2: 分步部署

**适用于**: 需要逐步验证或定制化部署

```bash
# 第1步: 仅初始化环境
./scripts/deploy.sh --env-only
# 完成后手动验证环境

# 第2步: 配置环境变量
cp env.example .env.production
nano .env.production

# 第3步: 完整部署
./scripts/deploy.sh --production
```

### 方式3: 快速部署

**适用于**: 已部署过的服务器，仅更新应用

```bash
# 快速部署 (跳过部分检查)
./scripts/deploy.sh --production --quick

# 耗时: 约 2-3 分钟
```

---

## 📋 部署前检查清单

在运行部署脚本前，请确保:

- [ ] 有Ubuntu 20.04+ 服务器的访问权限
- [ ] 有sudo权限或root权限
- [ ] 网络连接正常
- [ ] 磁盘空间充足 (至少50GB)
- [ ] 已准备好数据库连接信息
- [ ] 已准备好数据库密码

---

## 🔧 配置环境变量

### 快速配置步骤

```bash
# 1. 复制配置模板
cp env.example .env.production

# 2. 编辑配置文件
nano .env.production

# 3. 填写必需的配置项
```

### 必需配置项

| 配置项 | 说明 | 获取方式 |
|--------|------|---------|
| `DATABASE_URL` | 数据库连接 | 自配置: `mysql://user:pass@localhost/db` |
| `JWT_SECRET` | 会话密钥 | `openssl rand -base64 32` |
| `ADMIN_EMAIL` | 管理员邮箱 | 自配置 |

### 快速生成密钥

```bash
# 生成JWT_SECRET
openssl rand -base64 32

# 生成随机密码
openssl rand -base64 24
```

---

## 📊 部署流程详解

### 第1步: 环境检查 (1分钟)

脚本检查:
- 操作系统类型 (必须是Linux)
- 必需命令是否存在 (curl、wget、git等)
- Node.js、MySQL、pnpm是否已安装

### 第2步: 系统初始化 (3-5分钟)

脚本自动:
- 更新系统包
- 安装Node.js (如未安装)
- 安装MySQL服务器 (如未安装)
- 安装pnpm包管理器
- 创建应用用户和目录
- 创建日志和备份目录

### 第3步: 配置设置 (1分钟)

脚本:
- 复制环境变量文件
- 验证必需的环境变量
- 设置文件权限

### 第4步: 数据库初始化 (2-3分钟)

脚本:
- 检查数据库连接
- 创建数据库 (如不存在)
- 创建数据库用户
- 运行数据库迁移

### 第5步: 应用构建 (3-5分钟)

脚本:
- 安装项目依赖 (pnpm install)
- 构建前端应用 (pnpm build)
- 验证构建输出

### 第6步: 服务启动 (1分钟)

脚本:
- 配置PM2进程管理
- 启动应用进程
- 设置开机自启
- 配置Nginx反向代理
- 启动Nginx服务

### 第7步: 部署验证 (1分钟)

脚本:
- 检查应用状态
- 检查Nginx状态
- 验证数据库连接
- 执行健康检查

---

## 🎮 部署后常用命令

### 应用管理

```bash
# 查看应用状态
pm2 status

# 重启应用
pm2 restart research-match-system

# 停止应用
pm2 stop research-match-system

# 启动应用
pm2 start research-match-system

# 查看应用日志
pm2 logs research-match-system

# 实时监控
pm2 monit
```

### 快速脚本

```bash
# 启动应用和Nginx
./scripts/start.sh

# 停止应用和Nginx
./scripts/stop.sh
```

### 系统管理

```bash
# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看进程
ps aux | grep node

# 查看端口占用
sudo lsof -i :3000
```

---

## 🔄 更新应用

```bash
# 1. 进入项目目录
cd /opt/research-match-system

# 2. 拉取最新代码
git pull origin main

# 3. 安装依赖
pnpm install

# 4. 构建应用
pnpm build

# 5. 重启应用
pm2 restart research-match-system
```

---

## 🐛 常见问题

### Q1: 部署脚本执行失败

**原因**: 权限不足或脚本不可执行

**解决**:
```bash
chmod +x scripts/deploy.sh
sudo ./scripts/deploy.sh --production
```

### Q2: 数据库连接失败

**原因**: MySQL未启动或连接信息错误

**解决**:
```bash
# 检查MySQL状态
sudo systemctl status mysql

# 启动MySQL
sudo systemctl start mysql

# 验证连接
mysql -u app_user -p -h localhost research_match_system
```

### Q3: 端口被占用

**原因**: 端口3000或80已被其他应用占用

**解决**:
```bash
# 查找占用进程
sudo lsof -i :3000

# 杀死进程
sudo kill -9 <PID>
```

### Q4: 应用启动失败

**原因**: 环境变量配置错误或依赖缺失

**解决**:
```bash
# 查看详细日志
pm2 logs research-match-system

# 检查环境变量
cat .env.production

# 重新安装依赖
pnpm install
```

---

## 📞 获取帮助

遇到问题时，请按以下顺序查看:

1. **快速部署指南**: `QUICK_DEPLOY.md` - 包含详细的部署步骤和故障排查
2. **部署文档**: `DEPLOYMENT.md` - 完整的部署配置说明
3. **环境变量清单**: `ENV_CHECKLIST.md` - 所有环境变量的详细说明
4. **项目README**: `README.md` - 项目架构和模块说明
5. **应用日志**: `pm2 logs research-match-system` - 查看应用运行日志
6. **系统日志**: `/var/log/research-match-system/` - 查看系统日志

---

## ✅ 部署成功标志

部署完成后，您应该看到:

```
✅ 部署完成！
==========================================
应用地址: http://localhost
应用日志: pm2 logs research-match-system
查看状态: pm2 status
停止应用: pm2 stop research-match-system
重启应用: pm2 restart research-match-system
==========================================
```

此时:
- ✅ 应用在 `http://localhost` 可访问
- ✅ PM2应用状态为 `online`
- ✅ Nginx服务运行中
- ✅ 数据库连接正常

---

## 🔒 安全建议

### 部署后必做

- [ ] 修改MySQL默认密码
- [ ] 配置防火墙规则
- [ ] 启用SSL证书 (生产环境)
- [ ] 设置定期备份
- [ ] 配置监控告警
- [ ] 更新系统补丁

### 安全配置

```bash
# 配置防火墙
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 配置SSL (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com

# 启用自动备份
sudo crontab -e
# 0 2 * * * /usr/local/bin/backup-db.sh
```

---

## 📈 性能优化

部署后可进行的优化:

```bash
# 启用缓存
export REDIS_URL=redis://localhost:6379
pm2 restart research-match-system

# 增加Node.js内存
export NODE_OPTIONS="--max-old-space-size=2048"
pm2 restart research-match-system

# 调整数据库连接池
# 编辑 .env.production
DB_POOL_MIN=5
DB_POOL_MAX=20
pm2 restart research-match-system
```

---

## 📚 相关文档

- **QUICK_DEPLOY.md** - 快速部署指南 (推荐首先阅读)
- **DEPLOYMENT.md** - 完整部署文档
- **ENV_CHECKLIST.md** - 环境变量配置清单
- **README.md** - 项目架构和功能说明

---

**最后更新**: 2024年12月
**版本**: 1.0
**维护者**: DevOps Team

---

## 🎉 下一步

部署完成后，您可以:

1. **配置域名**: 将域名指向服务器IP，配置SSL证书
2. **监控应用**: 设置监控告警，定期检查应用状态
3. **备份数据**: 配置定期数据库备份
4. **优化性能**: 根据实际使用情况调整配置
5. **扩展功能**: 根据需求添加新功能或集成第三方服务

祝您部署顺利！如有问题，请参考上述文档或联系技术支持。
