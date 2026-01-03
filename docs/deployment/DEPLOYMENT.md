# 生产环境部署指南

本文档详细说明如何将智研匹配系统部署到生产环境。

---

## 📋 目录

- [系统要求](#系统要求)
- [部署前准备](#部署前准备)
- [环境变量配置](#环境变量配置)
- [数据库初始化](#数据库初始化)
- [应用部署](#应用部署)
- [性能优化](#性能优化)
- [监控和日志](#监控和日志)
- [常见问题排查](#常见问题排查)
- [灾难恢复](#灾难恢复)

---

## 🖥 系统要求

### 硬件要求

| 指标 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 2核 | 4核+ |
| 内存 | 4GB | 8GB+ |
| 存储 | 50GB | 100GB+ |
| 带宽 | 10Mbps | 100Mbps+ |

### 软件要求

| 软件 | 版本 | 说明 |
|------|------|------|
| Node.js | 20.0+ | 建议使用LTS版本 |
| npm/pnpm | 8.0+ | 包管理工具 |
| MySQL | 5.7+ | 或TiDB 5.0+ |
| Redis | 6.0+ | 可选，用于缓存 |
| Nginx | 1.20+ | 反向代理服务器 |

### 操作系统

- Ubuntu 20.04 LTS 或更高版本
- CentOS 8 或更高版本
- Debian 11 或更高版本

---

## 🔧 部署前准备

### 1. 服务器初始化

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git build-essential

# 安装Node.js (使用NodeSource仓库)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version

# 安装pnpm (推荐)
npm install -g pnpm
pnpm --version
```

### 2. 数据库准备

```bash
# 安装MySQL服务器
sudo apt install -y mysql-server

# 启动MySQL服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 创建数据库和用户
sudo mysql -u root -p << EOF
CREATE DATABASE research_match_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON research_match_system.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
EOF
```

### 3. 创建应用用户

```bash
# 创建专用用户运行应用
sudo useradd -m -s /bin/bash appuser

# 创建应用目录
sudo mkdir -p /opt/research-match-system
sudo chown -R appuser:appuser /opt/research-match-system

# 切换到应用用户
sudo su - appuser
```

### 4. 克隆项目

```bash
cd /opt/research-match-system
git clone <your-repository-url> .
git checkout main  # 或您的生产分支

# 安装依赖
pnpm install
```

---

## 🔐 环境变量配置

### 环境变量清单

创建 `.env.production` 文件，包含以下所有必需的环境变量：

```bash
# ============================================
# 应用基础配置
# ============================================

# 应用环境
NODE_ENV=production

# 应用端口
PORT=3000

# 应用名称和Logo
VITE_APP_TITLE=智研匹配系统
VITE_APP_LOGO=/logo.png

# ============================================
# 数据库配置
# ============================================

# MySQL连接字符串
# 格式: mysql://user:password@host:port/database
DATABASE_URL=mysql://app_user:strong_password_here@localhost:3306/research_match_system

# 连接池配置
DB_POOL_MIN=2
DB_POOL_MAX=10

# ============================================
# 认证配置
# ============================================

# JWT密钥 (用于会话签名，必须至少32字符)
# 生成方法: openssl rand -base64 32
JWT_SECRET=your_very_long_random_secret_key_min_32_chars

# ============================================
# 用户和权限配置
# ============================================

# 系统管理员邮箱 (用于创建初始管理员账户)
ADMIN_EMAIL=admin@example.com

# ============================================
# AI服务配置
# ============================================

# LLM模型选择 (可选)
LLM_MODEL=deepseek-chat

# LLM API超时时间 (毫秒)
LLM_TIMEOUT=30000

# ============================================
# 文件存储配置
# ============================================

# S3存储桶名称
S3_BUCKET_NAME=research-match-system

# S3区域
S3_REGION=us-east-1

# S3访问密钥 (可选，如使用IAM角色则不需要)
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key

# ============================================
# 邮件配置 (可选)
# ============================================

# SMTP服务器
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@research-match.com

# ============================================
# 日志配置
# ============================================

# 日志级别: debug, info, warn, error
LOG_LEVEL=info

# 日志文件路径
LOG_FILE=/var/log/research-match-system/app.log

# ============================================
# 安全配置
# ============================================

# CORS允许的源
CORS_ORIGIN=https://your-domain.com

# 会话超时时间 (秒)
SESSION_TIMEOUT=86400

# 密码最小长度
PASSWORD_MIN_LENGTH=8

# ============================================
# 性能配置
# ============================================

# Redis缓存地址 (可选)
REDIS_URL=redis://localhost:6379

# 缓存过期时间 (秒)
CACHE_TTL=3600

# API速率限制 (请求/分钟)
RATE_LIMIT=100

# ============================================
# 特性开关
# ============================================

# 启用AI匹配功能
ENABLE_AI_MATCH=true

# 启用邮件通知
ENABLE_EMAIL_NOTIFICATION=false

# 启用调试模式
DEBUG_MODE=false
```

### 环境变量详细说明

#### 必需的环境变量

| 变量名 | 说明 | 示例值 | 来源 |
|--------|------|--------|------|
| `DATABASE_URL` | 数据库连接字符串 | `mysql://user:pass@host/db` | 自配置 |
| `JWT_SECRET` | JWT签名密钥 | `your_secret_key_32_chars_min` | 自生成 |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@example.com` | 自配置 |

#### 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `REDIS_URL` | Redis缓存地址 | 无（禁用缓存） |
| `SMTP_HOST` | SMTP邮件服务器 | 无（禁用邮件） |
| `LOG_LEVEL` | 日志级别 | `info` |
| `RATE_LIMIT` | API速率限制 | `100` |

### 生成安全的密钥

```bash
# 生成JWT_SECRET (32字符以上)
openssl rand -base64 32

# 生成随机密码
openssl rand -base64 24

# 示例输出
# rN7x9kL2mP4qR6sT8uV0wX1yZ2aB3cD4eF5gH6iJ7kL8m=
```

### 环境变量文件位置

```bash
# 项目根目录创建
/opt/research-match-system/.env.production

# 权限设置 (仅所有者可读)
chmod 600 /opt/research-match-system/.env.production
```

---

## 💾 数据库初始化

### 1. 创建数据库表

```bash
cd /opt/research-match-system

# 生成迁移文件
pnpm db:push

# 验证表创建成功
mysql -u app_user -p research_match_system << EOF
SHOW TABLES;
DESCRIBE users;
EOF
```

### 2. 初始化管理员账户

```bash
# 创建初始化脚本
cat > scripts/init-admin.mjs << 'EOF'
import { getDb } from "./server/db.ts";
import { users } from "./drizzle/schema.ts";

const db = await getDb();
if (!db) throw new Error("Database connection failed");

      // 插入管理员用户
await db.insert(users).values({
  openId: `local_${process.env.ADMIN_EMAIL}`,
  name: process.env.ADMIN_NAME || "Admin",
  email: process.env.ADMIN_EMAIL,
  role: "admin",
  loginMethod: "local",
});

console.log("Admin user created successfully");
EOF

# 运行初始化脚本
node scripts/init-admin.mjs
```

### 3. 备份数据库

```bash
# 创建备份目录
mkdir -p /var/backups/research-match-system

# 定期备份脚本
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/research-match-system"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/research_match_$DATE.sql"

mysqldump -u app_user -p$DB_PASSWORD research_match_system > $BACKUP_FILE
gzip $BACKUP_FILE

# 保留最近7天的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
EOF

chmod +x /usr/local/bin/backup-db.sh

# 添加到crontab (每天凌晨2点备份)
crontab -e
# 0 2 * * * /usr/local/bin/backup-db.sh
```

---

## 🚀 应用部署

### 1. 构建应用

```bash
cd /opt/research-match-system

# 安装依赖
pnpm install --prod

# 构建前端
pnpm build

# 验证构建
ls -la dist/
```

### 2. 使用PM2进程管理

```bash
# 全局安装PM2
sudo npm install -g pm2

# 创建PM2配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "research-match-system",
      script: "./dist/index.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
      error_file: "/var/log/research-match-system/error.log",
      out_file: "/var/log/research-match-system/out.log",
      log_file: "/var/log/research-match-system/combined.log",
      time: true,
      max_memory_restart: "1G",
      watch: false,
      ignore_watch: ["node_modules", "dist"],
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
EOF

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save

# 查看应用状态
pm2 status
pm2 logs research-match-system
```

### 3. 配置Nginx反向代理

```bash
# 创建Nginx配置
sudo tee /etc/nginx/sites-available/research-match-system << 'EOF'
upstream research_match_backend {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 日志
    access_log /var/log/nginx/research-match-access.log;
    error_log /var/log/nginx/research-match-error.log;

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API代理
    location /api/ {
        proxy_pass http://research_match_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 前端应用
    location / {
        proxy_pass http://research_match_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SPA路由处理
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 启用配置
sudo ln -s /etc/nginx/sites-available/research-match-system \
           /etc/nginx/sites-enabled/research-match-system

# 测试Nginx配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 4. SSL证书配置 (Let's Encrypt)

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 验证续期配置
sudo certbot renew --dry-run
```

---

## ⚡ 性能优化

### 1. 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_users_openid ON users(openId);
CREATE INDEX idx_projects_teacher_id ON projects(teacher_id);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_project_id ON applications(project_id);
CREATE INDEX idx_applications_status ON applications(status);

-- 启用查询缓存
SET GLOBAL query_cache_type = ON;
SET GLOBAL query_cache_size = 268435456;  -- 256MB

-- 调整连接参数
SET GLOBAL max_connections = 1000;
SET GLOBAL max_allowed_packet = 67108864;  -- 64MB
```

### 2. 应用级缓存

```typescript
// 在 server/routers.ts 中使用缓存
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL,
});

// 缓存项目列表
project: router({
  list: publicProcedure.query(async () => {
    const cacheKey = 'projects:list';
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const projects = await db.getAllProjects();
    await redis.setex(cacheKey, 3600, JSON.stringify(projects));
    
    return projects;
  }),
}),
```

### 3. 前端优化

```typescript
// 代码分割
import { lazy, Suspense } from 'react';

const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'));

// 使用Suspense
<Suspense fallback={<Loading />}>
  <StudentDashboard />
</Suspense>
```

### 4. Nginx性能调优

```nginx
# 在 /etc/nginx/nginx.conf 中
worker_processes auto;
worker_connections 2048;
keepalive_timeout 65;
client_max_body_size 100M;

# 启用gzip压缩
gzip on;
gzip_min_length 1000;
gzip_types text/plain text/css text/xml text/javascript 
           application/x-javascript application/xml+rss;
gzip_disable "msie6";
```

---

## 📊 监控和日志

### 1. 日志配置

```bash
# 创建日志目录
sudo mkdir -p /var/log/research-match-system
sudo chown appuser:appuser /var/log/research-match-system

# 配置日志轮转
sudo tee /etc/logrotate.d/research-match-system << 'EOF'
/var/log/research-match-system/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 appuser appuser
    sharedscripts
    postrotate
        pm2 reload research-match-system > /dev/null 2>&1 || true
    endscript
}
EOF
```

### 2. 健康检查

```bash
# 创建健康检查脚本
cat > /usr/local/bin/health-check.sh << 'EOF'
#!/bin/bash

# 检查应用状态
curl -f http://localhost:3000/api/health || exit 1

# 检查数据库连接
mysql -u app_user -p$DB_PASSWORD -e "SELECT 1" research_match_system || exit 1

# 检查磁盘空间
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "Disk usage critical: $DISK_USAGE%"
    exit 1
fi

echo "Health check passed"
exit 0
EOF

chmod +x /usr/local/bin/health-check.sh

# 添加到crontab (每5分钟检查一次)
# */5 * * * * /usr/local/bin/health-check.sh
```

### 3. 监控工具集成

```bash
# 安装Prometheus Node Exporter
sudo apt install -y prometheus-node-exporter

# 启动服务
sudo systemctl start prometheus-node-exporter
sudo systemctl enable prometheus-node-exporter

# 验证指标
curl http://localhost:9100/metrics
```

---

## 🐛 常见问题排查

### 问题1: 数据库连接失败

**症状**: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**解决方案**:
```bash
# 检查MySQL服务状态
sudo systemctl status mysql

# 启动MySQL
sudo systemctl start mysql

# 验证连接
mysql -u app_user -p -h localhost research_match_system

# 检查DATABASE_URL格式
# 确保格式为: mysql://user:password@host:port/database
```

### 问题2: 内存溢出

**症状**: `JavaScript heap out of memory`

**解决方案**:
```bash
# 增加Node.js内存限制
NODE_OPTIONS="--max-old-space-size=2048" pm2 start ecosystem.config.js

# 或在PM2配置中设置
# "node_args": "--max-old-space-size=2048"

# 检查内存使用
pm2 monit
```

### 问题3: 高CPU占用

**症状**: CPU使用率持续>80%

**排查步骤**:
```bash
# 查看进程详情
top -p $(pgrep -f "node dist/index.js")

# 检查日志
pm2 logs research-match-system

# 查看慢查询
mysql -u app_user -p << EOF
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
SELECT * FROM mysql.slow_log;
EOF
```

### 问题4: SSL证书过期

**症状**: `SSL_ERROR_RX_RECORD_TOO_LONG` 或浏览器警告

**解决方案**:
```bash
# 检查证书有效期
sudo certbot certificates

# 手动续期
sudo certbot renew --force-renewal

# 验证Nginx配置
sudo nginx -t
sudo systemctl reload nginx
```

### 问题5: API响应缓慢

**排查步骤**:
```bash
# 1. 检查数据库性能
EXPLAIN SELECT * FROM projects WHERE status = 'published';

# 2. 启用慢查询日志
SET GLOBAL slow_query_log = 'ON';

# 3. 检查缓存是否工作
redis-cli INFO stats

# 4. 查看Nginx响应时间
tail -f /var/log/nginx/research-match-access.log | grep -o 'upstream_response_time [^,]*'
```

---

## 🔄 灾难恢复

### 1. 数据库恢复

```bash
# 列出备份文件
ls -lh /var/backups/research-match-system/

# 恢复数据库
gunzip < /var/backups/research-match-system/research_match_20240101_020000.sql.gz | \
  mysql -u app_user -p research_match_system

# 验证恢复
mysql -u app_user -p -e "SELECT COUNT(*) FROM research_match_system.users;"
```

### 2. 应用回滚

```bash
# 查看Git历史
git log --oneline

# 回滚到指定版本
git checkout <commit-hash>

# 重新构建和部署
pnpm install
pnpm build
pm2 restart research-match-system
```

### 3. 紧急停止

```bash
# 停止应用
pm2 stop research-match-system

# 停止Nginx
sudo systemctl stop nginx

# 维护页面
sudo tee /var/www/html/maintenance.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>系统维护中</title></head>
<body>
    <h1>系统正在维护中，请稍后访问</h1>
</body>
</html>
EOF
```

---

## 📋 部署检查清单

部署前请确保完成以下检查:

- [ ] 服务器硬件和软件要求满足
- [ ] 所有必需的环境变量已配置
- [ ] 数据库已创建并初始化
- [ ] 应用已成功构建
- [ ] PM2配置正确
- [ ] Nginx配置正确
- [ ] SSL证书已安装
- [ ] 防火墙规则已配置
- [ ] 备份策略已启用
- [ ] 监控和日志已配置
- [ ] 性能测试已通过
- [ ] 安全审计已完成

---

## 📞 支持和维护

### 定期维护任务

| 任务 | 频率 | 命令 |
|------|------|------|
| 数据库备份 | 每天 | `backup-db.sh` |
| 日志轮转 | 自动 | logrotate |
| 证书续期 | 自动 | certbot |
| 系统更新 | 每月 | `apt update && apt upgrade` |
| 性能检查 | 每周 | `pm2 monit` |

### 应急联系

- 技术支持: support@example.com
- 紧急热线: +86-xxx-xxxx-xxxx
- 文档: https://docs.example.com

---

**最后更新**: 2024年12月
**版本**: 1.0
**维护者**: DevOps Team
