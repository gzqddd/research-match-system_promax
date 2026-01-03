# 一键部署指南 (Ubuntu)

本指南提供快速部署智研匹配系统到Ubuntu服务器的完整步骤。

---

## 📋 目录

- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [部署步骤](#部署步骤)
- [常用命令](#常用命令)
- [故障排查](#故障排查)

---

## 🖥 系统要求

| 要求 | 最低配置 | 推荐配置 |
|------|---------|---------|
| 操作系统 | Ubuntu 20.04 LTS | Ubuntu 22.04 LTS |
| CPU | 2核 | 4核+ |
| 内存 | 4GB | 8GB+ |
| 存储 | 50GB | 100GB+ |
| 网络 | 10Mbps | 100Mbps+ |

---

## ⚡ 快速开始

### 方式1: 完全自动部署 (推荐)

```bash
# 1. 克隆项目
git clone <your-repository-url> /opt/research-match-system
cd /opt/research-match-system

# 2. 创建环境配置
cp .env.production.example .env.production
# 编辑 .env.production，填入实际的配置值
nano .env.production

# 3. 运行部署脚本
chmod +x scripts/deploy.sh
./scripts/deploy.sh --production

# 完成！应用已在 http://localhost 运行
```

### 方式2: 分步部署

```bash
# 1. 仅初始化环境
./scripts/deploy.sh --env-only

# 2. 配置环境变量
cp .env.production.example .env.production
nano .env.production

# 3. 完整部署
./scripts/deploy.sh --production
```

### 方式3: 快速部署 (跳过部分检查)

```bash
# 适用于已部署过的服务器
./scripts/deploy.sh --production --quick
```

---

## 📝 部署步骤

### 第1步: 准备服务器

```bash
# 连接到服务器
ssh user@your-server-ip

# 切换到root用户 (或使用sudo)
sudo -i

# 更新系统
apt update && apt upgrade -y
```

### 第2步: 克隆项目

```bash
# 创建应用目录
mkdir -p /opt
cd /opt

# 克隆项目
git clone <your-repository-url> research-match-system
cd research-match-system

# 验证项目结构
ls -la
# 应该看到: scripts/, client/, server/, drizzle/, package.json 等
```

### 第3步: 配置环境变量

```bash
# 复制配置模板
cp env.example .env.production

# 编辑配置文件
nano .env.production
```

**必须填写的配置**:

| 变量 | 说明 | 获取方式 |
|------|------|---------|
| `DATABASE_URL` | 数据库连接 | 自配置 |
| `JWT_SECRET` | 会话密钥 | `openssl rand -base64 32` |
| `ADMIN_EMAIL` | 管理员邮箱 | 自配置 |

**快速生成JWT_SECRET**:

```bash
openssl rand -base64 32
# 输出示例: rN7x9kL2mP4qR6sT8uV0wX1yZ2aB3cD4eF5gH6iJ7kL8m=
```

### 第4步: 运行部署脚本

```bash
# 添加执行权限
chmod +x scripts/deploy.sh

# 运行部署
./scripts/deploy.sh --production
```

**部署脚本会自动完成**:
- ✅ 检查系统环境
- ✅ 安装依赖 (Node.js, MySQL, Nginx等)
- ✅ 初始化数据库
- ✅ 构建应用
- ✅ 启动PM2进程
- ✅ 配置Nginx
- ✅ 验证部署

### 第5步: 验证部署

```bash
# 检查应用状态
pm2 status

# 查看应用日志
pm2 logs research-match-system

# 测试应用
curl http://localhost

# 检查Nginx状态
sudo systemctl status nginx
```

---

## 🎮 常用命令

### 启动/停止/重启

```bash
# 启动应用
./scripts/start.sh

# 停止应用
./scripts/stop.sh

# 重启应用
pm2 restart research-match-system

# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs research-match-system

# 监控应用
pm2 monit
```

### 数据库操作

```bash
# 连接数据库
mysql -u app_user -p -h localhost research_match_system

# 备份数据库
mysqldump -u app_user -p research_match_system > backup.sql

# 恢复数据库
mysql -u app_user -p research_match_system < backup.sql
```

### Nginx操作

```bash
# 检查Nginx配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 查看Nginx日志
sudo tail -f /var/log/nginx/research-match-error.log
```

### 应用管理

```bash
# 查看PM2进程
pm2 list

# 停止应用
pm2 stop research-match-system

# 启动应用
pm2 start research-match-system

# 删除应用
pm2 delete research-match-system

# 设置开机自启
pm2 startup
pm2 save
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

## 🔐 安全配置

### 配置SSL证书 (Let's Encrypt)

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot certonly --nginx -d your-domain.com

# 更新Nginx配置
sudo nano /etc/nginx/sites-available/research-match-system
# 添加SSL配置...

# 自动续期
sudo systemctl enable certbot.timer
```

### 配置防火墙

```bash
# 允许SSH
sudo ufw allow 22/tcp

# 允许HTTP
sudo ufw allow 80/tcp

# 允许HTTPS
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable
```

### 配置备份

```bash
# 创建备份脚本
sudo nano /usr/local/bin/backup-db.sh

# 添加以下内容:
#!/bin/bash
BACKUP_DIR="/var/backups/research-match-system"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u app_user -p$DB_PASSWORD research_match_system > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# 设置执行权限
sudo chmod +x /usr/local/bin/backup-db.sh

# 添加到crontab (每天凌晨2点备份)
sudo crontab -e
# 0 2 * * * /usr/local/bin/backup-db.sh
```

---

## 🐛 故障排查

### 问题1: 部署脚本权限不足

**错误信息**: `Permission denied`

**解决方案**:
```bash
# 添加执行权限
chmod +x scripts/deploy.sh

# 或使用sudo运行
sudo ./scripts/deploy.sh --production
```

### 问题2: 数据库连接失败

**错误信息**: `Error: connect ECONNREFUSED`

**解决方案**:
```bash
# 检查MySQL服务
sudo systemctl status mysql

# 启动MySQL
sudo systemctl start mysql

# 验证连接
mysql -u app_user -p -h localhost research_match_system
```

### 问题3: 端口被占用

**错误信息**: `EADDRINUSE: address already in use :::3000`

**解决方案**:
```bash
# 查找占用端口的进程
sudo lsof -i :3000

# 杀死进程
sudo kill -9 <PID>

# 或修改PORT环境变量
export PORT=3001
pm2 restart research-match-system
```

### 问题4: 应用启动失败

**排查步骤**:
```bash
# 查看详细日志
pm2 logs research-match-system

# 查看PM2错误日志
cat /var/log/research-match-system/error.log

# 检查环境变量
cat .env.production

# 验证数据库连接
mysql -u app_user -p research_match_system -e "SELECT 1;"
```

### 问题5: Nginx无法访问应用

**错误信息**: `502 Bad Gateway`

**解决方案**:
```bash
# 检查应用是否运行
pm2 status

# 检查应用日志
pm2 logs research-match-system

# 检查Nginx配置
sudo nginx -t

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/research-match-error.log

# 重启Nginx
sudo systemctl restart nginx
```

---

## 📊 监控和维护

### 查看系统资源

```bash
# 查看应用内存使用
pm2 monit

# 查看系统资源
top

# 查看磁盘使用
df -h

# 查看数据库大小
mysql -u app_user -p -e "SELECT table_schema, ROUND(SUM(data_length+index_length)/1024/1024,2) FROM information_schema.tables GROUP BY table_schema;"
```

### 查看日志

```bash
# 应用日志
pm2 logs research-match-system

# Nginx访问日志
sudo tail -f /var/log/nginx/research-match-access.log

# Nginx错误日志
sudo tail -f /var/log/nginx/research-match-error.log

# 系统日志
sudo journalctl -u research-match-system -f
```

### 性能优化

```bash
# 增加Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=2048"
pm2 restart research-match-system

# 启用缓存
export REDIS_URL=redis://localhost:6379
pm2 restart research-match-system

# 调整数据库连接池
# 编辑 .env.production
DB_POOL_MIN=5
DB_POOL_MAX=20
pm2 restart research-match-system
```

---

## 📞 获取帮助

如果遇到问题，请参考:

1. **部署文档**: 查看 `DEPLOYMENT.md`
2. **环境变量**: 查看 `ENV_CHECKLIST.md`
3. **项目README**: 查看 `README.md`
4. **应用日志**: `pm2 logs research-match-system`
5. **Nginx日志**: `/var/log/nginx/research-match-error.log`

---

## ✅ 部署检查清单

部署完成后，请确保:

- [ ] 应用在 http://localhost 可访问
- [ ] 数据库连接正常
- [ ] PM2应用状态为 `online`
- [ ] Nginx服务运行中
- [ ] 日志文件无错误
- [ ] 防火墙规则已配置
- [ ] 备份策略已启用
- [ ] SSL证书已安装 (生产环境)
- [ ] 监控告警已配置

---

**最后更新**: 2024年12月
**版本**: 1.0
