# 环境变量配置清单

本文档列出所有必需和可选的环境变量，以及如何获取和配置它们。

---

## 📋 快速参考表

| 环境变量 | 必需 | 说明 | 获取方式 |
|---------|------|------|---------|
| `NODE_ENV` | ✅ | 应用环境 | 手动设置 |
| `PORT` | ✅ | 应用端口 | 手动设置 |
| `DATABASE_URL` | ✅ | 数据库连接 | 自配置 |
| `JWT_SECRET` | ✅ | 会话密钥 | 自生成 |
| `ADMIN_EMAIL` | ✅ | 管理员邮箱 | 自配置 |
| `REDIS_URL` | ❌ | 缓存服务 | 可选 |
| `SMTP_HOST` | ❌ | 邮件服务 | 可选 |

---

## 🔴 必需的环境变量

### 1. NODE_ENV
**用途**: 指定应用运行环境

**可选值**:
- `production`: 生产环境
- `development`: 开发环境
- `staging`: 预发布环境

**设置方法**:
```bash
export NODE_ENV=production
```

**验证**:
```bash
echo $NODE_ENV
```

---

### 2. PORT
**用途**: 应用监听的HTTP端口

**推荐值**: `3000` (开发) 或 `8080` (生产)

**设置方法**:
```bash
export PORT=3000
```

**验证**:
```bash
curl http://localhost:3000/api/health
```

---

### 3. DATABASE_URL
**用途**: 数据库连接字符串

**格式**: `mysql://用户名:密码@主机:端口/数据库名`

**示例**:
```
mysql://app_user:strong_password@db.example.com:3306/research_match_system
```

**获取方式**:
1. 创建MySQL数据库
2. 创建数据库用户和密码
3. 组合成连接字符串

**创建数据库脚本**:
```bash
mysql -u root -p << EOF
CREATE DATABASE research_match_system CHARACTER SET utf8mb4;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON research_match_system.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
EOF
```

**验证**:
```bash
mysql -u app_user -p -h localhost research_match_system -e "SELECT 1;"
```

---

### 4. JWT_SECRET
**用途**: JWT会话签名密钥

**生成方法**:
```bash
# 方法1: 使用OpenSSL
openssl rand -base64 32

# 方法2: 使用Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 方法3: 使用Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**示例输出**:
```
rN7x9kL2mP4qR6sT8uV0wX1yZ2aB3cD4eF5gH6iJ7kL8m=
```

**要求**:
- 最小长度: 32字符
- 建议长度: 64字符
- 包含大小写字母、数字、特殊字符

**设置方法**:
```bash
export JWT_SECRET="rN7x9kL2mP4qR6sT8uV0wX1yZ2aB3cD4eF5gH6iJ7kL8m="
```

---

### 5. ADMIN_EMAIL
**用途**: 系统管理员邮箱（用于创建初始管理员账户）

**格式**: 有效的邮箱地址

**示例**:
```bash
export ADMIN_EMAIL=admin@example.com
```

**说明**:
- 系统首次启动时会使用此邮箱创建管理员账户
- 管理员可以使用此邮箱登录系统
- 建议使用安全的邮箱地址

---

## 🟢 可选的环境变量

### 缓存配置

#### REDIS_URL
**用途**: Redis缓存服务地址

**格式**: `redis://[:password]@host:port/database`

**示例**:
```
redis://localhost:6379
redis://:password@cache.example.com:6379/0
```

**安装Redis** (Ubuntu):
```bash
sudo apt install -y redis-server
sudo systemctl start redis-server
```

**验证**:
```bash
redis-cli ping
# 应该输出: PONG
```

#### CACHE_TTL
**用途**: 缓存过期时间

**单位**: 秒

**默认值**: `3600` (1小时)

**示例**:
```bash
export CACHE_TTL=3600
```

---

### 邮件配置

#### SMTP_HOST
**用途**: SMTP邮件服务器地址

**常见服务提供商**:
- Gmail: `smtp.gmail.com`
- QQ邮箱: `smtp.qq.com`
- 163邮箱: `smtp.163.com`
- 企业邮箱: 自定义服务器

**示例**:
```bash
export SMTP_HOST=smtp.gmail.com
```

#### SMTP_PORT
**用途**: SMTP服务器端口

**常见端口**:
- 25: 标准SMTP
- 587: SMTP with TLS
- 465: SMTP with SSL

**示例**:
```bash
export SMTP_PORT=587
```

#### SMTP_USER
**用途**: SMTP用户名或邮箱地址

**示例**:
```bash
export SMTP_USER=your_email@gmail.com
```

#### SMTP_PASSWORD
**用途**: SMTP密码或应用密码

**获取方式** (Gmail):
1. 启用两步验证
2. 生成应用密码
3. 使用应用密码而不是账户密码

**示例**:
```bash
export SMTP_PASSWORD=your_app_password
```

#### SMTP_FROM
**用途**: 发件人邮箱地址

**示例**:
```bash
export SMTP_FROM=noreply@research-match.com
```

---

### 文件存储配置

#### S3_BUCKET_NAME
**用途**: AWS S3存储桶名称

**示例**:
```bash
export S3_BUCKET_NAME=research-match-system
```

#### S3_REGION
**用途**: AWS S3区域

**示例**:
```bash
export S3_REGION=us-east-1
```

#### S3_ACCESS_KEY_ID
**用途**: AWS访问密钥ID

**示例**:
```bash
export S3_ACCESS_KEY_ID=your_access_key
```

#### S3_SECRET_ACCESS_KEY
**用途**: AWS密钥

**示例**:
```bash
export S3_SECRET_ACCESS_KEY=your_secret_key
```

---

### 日志配置

#### LOG_LEVEL
**用途**: 日志输出级别

**可选值**:
- `debug`: 详细调试信息
- `info`: 一般信息
- `warn`: 警告信息
- `error`: 错误信息

**示例**:
```bash
export LOG_LEVEL=info
```

#### LOG_FILE
**用途**: 日志文件保存路径

**示例**:
```bash
export LOG_FILE=/var/log/research-match-system/app.log
```

**创建日志目录**:
```bash
sudo mkdir -p /var/log/research-match-system
sudo chown appuser:appuser /var/log/research-match-system
```

---

### 安全配置

#### CORS_ORIGIN
**用途**: 允许的跨域请求源

**格式**: 逗号分隔的URL列表

**示例**:
```bash
export CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

#### SESSION_TIMEOUT
**用途**: 会话超时时间

**单位**: 秒

**默认值**: `86400` (24小时)

**示例**:
```bash
export SESSION_TIMEOUT=86400
```

#### FORCE_HTTPS
**用途**: 是否强制HTTPS重定向

**可选值**: `true` 或 `false`

**示例**:
```bash
export FORCE_HTTPS=true
```

---

### 性能配置

#### RATE_LIMIT
**用途**: API速率限制

**单位**: 请求/分钟

**默认值**: `100`

**示例**:
```bash
export RATE_LIMIT=100
```

#### DB_QUERY_TIMEOUT
**用途**: 数据库查询超时时间

**单位**: 毫秒

**默认值**: `30000` (30秒)

**示例**:
```bash
export DB_QUERY_TIMEOUT=30000
```

---

### 特性开关

#### ENABLE_AI_MATCH
**用途**: 启用/禁用AI匹配功能

**可选值**: `true` 或 `false`

**示例**:
```bash
export ENABLE_AI_MATCH=true
```

#### ENABLE_EMAIL_NOTIFICATION
**用途**: 启用/禁用邮件通知

**可选值**: `true` 或 `false`

**示例**:
```bash
export ENABLE_EMAIL_NOTIFICATION=false
```

#### DEBUG_MODE
**用途**: 启用/禁用调试模式

**可选值**: `true` 或 `false`

**生产环境建议**: `false`

**示例**:
```bash
export DEBUG_MODE=false
```

---

## 🔧 配置方法

### 方法1: 使用环境变量文件

创建 `.env.production` 文件:

```bash
cat > /opt/research-match-system/.env.production << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://app_user:password@localhost:3306/research_match_system
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com
# ... 其他变量
EOF

# 设置文件权限 (仅所有者可读)
chmod 600 /opt/research-match-system/.env.production
```

### 方法2: 使用系统环境变量

```bash
# 临时设置 (当前会话)
export NODE_ENV=production
export DATABASE_URL=mysql://...

# 永久设置 (添加到 ~/.bashrc 或 ~/.profile)
echo 'export NODE_ENV=production' >> ~/.bashrc
source ~/.bashrc
```

### 方法3: 使用PM2环境文件

在 `ecosystem.config.js` 中:

```javascript
module.exports = {
  apps: [{
    name: "research-match-system",
    script: "./dist/index.js",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      DATABASE_URL: "mysql://...",
      // ... 其他变量
    }
  }]
};
```

---

## ✅ 配置验证

### 验证所有必需变量

```bash
#!/bin/bash

REQUIRED_VARS=(
  "NODE_ENV"
  "DATABASE_URL"
  "JWT_SECRET"
  "ADMIN_EMAIL"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ 缺少必需变量: $var"
    exit 1
  else
    echo "✅ $var 已配置"
  fi
done

echo "✅ 所有必需变量已配置"
```

### 验证数据库连接

```bash
# 测试连接
mysql -u app_user -p -h localhost research_match_system -e "SELECT 1;"

# 如果连接成功，应该输出:
# +---+
# | 1 |
# +---+
# | 1 |
# +---+
```

---

## 🔐 安全最佳实践

### 1. 密钥管理

- ✅ 使用强随机密钥
- ✅ 定期轮换密钥
- ✅ 使用密钥管理服务 (如AWS Secrets Manager)
- ❌ 不要在代码中硬编码密钥
- ❌ 不要在版本控制中提交密钥

### 2. 访问控制

- ✅ 限制环境变量文件的访问权限 (chmod 600)
- ✅ 仅在需要的地方暴露API密钥
- ✅ 使用IAM角色而不是长期凭证
- ❌ 不要将密钥发送给不信任的人

### 3. 审计和监控

- ✅ 记录所有密钥访问
- ✅ 监控异常API调用
- ✅ 定期审查访问日志
- ✅ 设置告警规则

### 4. 备份和恢复

- ✅ 备份环境变量配置
- ✅ 测试恢复流程
- ✅ 保存在安全位置
- ✅ 使用加密存储

---

## 📞 故障排查

### 问题: 环境变量未被读取

**检查步骤**:
```bash
# 1. 验证变量是否设置
echo $DATABASE_URL

# 2. 检查.env文件是否存在
ls -la .env.production

# 3. 检查应用是否正确加载.env
grep "dotenv" package.json
```

### 问题: 数据库连接失败

**检查步骤**:
```bash
# 1. 验证DATABASE_URL格式
echo $DATABASE_URL

# 2. 测试MySQL连接
mysql -u app_user -p -h localhost research_match_system

# 3. 检查MySQL服务状态
sudo systemctl status mysql
```

---

## 📚 参考资源

- [MySQL文档](https://dev.mysql.com/doc/)
- [Redis文档](https://redis.io/documentation)
- [Node.js环境变量](https://nodejs.org/api/process.html#process_process_env)

---

**最后更新**: 2024年12月
**版本**: 1.0
