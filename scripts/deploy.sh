#!/bin/bash

################################################################################
# 智研匹配系统 - 一键部署脚本 (Ubuntu)
# 
# 使用方法:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh [选项]
#
# 选项:
#   --help              显示帮助信息
#   --env-only          仅初始化环境
#   --quick             快速部署 (跳过一些检查)
#   --production        生产环境部署
#   --staging           预发布环境部署
#   --dev               开发环境部署
#
# 示例:
#   ./scripts/deploy.sh --production
#   ./scripts/deploy.sh --staging --quick
#
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 确保 pnpm 可用（设置 PATH）
ensure_pnpm_available() {
    if command -v pnpm &> /dev/null; then
        return 0
    fi
    
    # 尝试从 .bashrc 加载
    if [ -f "$HOME/.bashrc" ]; then
        source "$HOME/.bashrc" 2>/dev/null || true
    fi
    
    # 检查常见安装位置
    if [ -d "$HOME/.local/share/pnpm" ]; then
        export PNPM_HOME="$HOME/.local/share/pnpm"
        export PATH="$PNPM_HOME:$PATH"
    fi
    
    # 再次检查
    if command -v pnpm &> /dev/null; then
        return 0
    fi
    
    return 1
}

# 配置 pnpm 镜像源（使用国内镜像提高下载速度）
configure_pnpm_registry() {
    ensure_pnpm_available || return 1
    
    log_info "配置 pnpm 镜像源（使用淘宝镜像）..."
    
    # 设置淘宝镜像源
    pnpm config set registry https://registry.npmmirror.com 2>/dev/null || true
    
    # 增加网络超时时间（10分钟）
    pnpm config set network-timeout 600000 2>/dev/null || true
    
    # 显示当前配置
    local current_registry=$(pnpm config get registry 2>/dev/null || echo "unknown")
    log_info "当前镜像源: $current_registry"
    
    return 0
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 默认配置
ENVIRONMENT="production"
QUICK_MODE=false
ENV_ONLY=false
SHOW_HELP=false

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            SHOW_HELP=true
            shift
            ;;
        --env-only)
            ENV_ONLY=true
            shift
            ;;
        --quick)
            QUICK_MODE=true
            shift
            ;;
        --production)
            ENVIRONMENT="production"
            shift
            ;;
        --staging)
            ENVIRONMENT="staging"
            shift
            ;;
        --dev)
            ENVIRONMENT="development"
            shift
            ;;
        *)
            log_error "未知选项: $1"
            SHOW_HELP=true
            shift
            ;;
    esac
done

# 显示帮助信息
if [ "$SHOW_HELP" = true ]; then
    cat << 'EOF'
智研匹配系统 - 一键部署脚本

使用方法:
  ./scripts/deploy.sh [选项]

选项:
  --help              显示此帮助信息
  --env-only          仅初始化环境，不部署应用
  --quick             快速部署模式 (跳过一些检查)
  --production        生产环境部署 (默认)
  --staging           预发布环境部署
  --dev               开发环境部署

示例:
  # 生产环境完整部署
  ./scripts/deploy.sh --production

  # 快速部署到预发布环境
  ./scripts/deploy.sh --staging --quick

  # 仅初始化环境
  ./scripts/deploy.sh --env-only

环境变量:
  部署脚本会自动从以下位置读取环境变量:
  1. .env.${ENVIRONMENT} 文件 (优先级最高)
  2. .env 文件
  3. 系统环境变量

部署流程:
  1. 环境检查 (检查依赖、权限等)
  2. 环境初始化 (安装依赖、创建用户等)
  3. 配置设置 (复制配置文件、设置权限)
  4. 数据库初始化 (创建数据库、运行迁移)
  5. 应用构建 (npm build)
  6. 服务启动 (PM2、Nginx)
  7. 验证检查 (健康检查)

故障排查:
  如果部署失败，请查看日志:
  - 应用日志: /var/log/research-match-system/
  - PM2日志: pm2 logs research-match-system
  - Nginx日志: sudo tail -f /var/log/nginx/research-match-error.log

EOF
    exit 0
fi

################################################################################
# 第1步: 环境检查
################################################################################

check_environment() {
    log_info "开始环境检查..."

    # 检查操作系统
    if [[ ! "$OSTYPE" =~ ^linux ]]; then
        log_error "此脚本仅支持Linux系统"
        exit 1
    fi

    # 检查是否为Ubuntu/Debian
    if ! command -v apt &> /dev/null; then
        log_error "此脚本仅支持Ubuntu/Debian系统"
        exit 1
    fi

    log_success "操作系统检查通过"

    # 检查必需的命令
    local required_commands=("curl" "wget" "git")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_warn "缺少命令: $cmd，将自动安装"
        fi
    done

    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_warn "未检测到Node.js，将自动安装"
    else
        local node_version=$(node -v)
        log_success "检测到Node.js: $node_version"
    fi

    # 检查MySQL
    if ! command -v mysql &> /dev/null; then
        log_warn "未检测到MySQL客户端，将自动安装"
    else
        log_success "检测到MySQL客户端"
    fi

    # 检查pnpm (先尝试加载 PATH 配置)
    # 尝试加载 .bashrc 以更新 PATH (如果 pnpm 已安装但 PATH 未更新)
    if [ -f "$HOME/.bashrc" ]; then
        source "$HOME/.bashrc" 2>/dev/null || true
    fi
    if [ -f "$HOME/.zshrc" ]; then
        source "$HOME/.zshrc" 2>/dev/null || true
    fi
    
    # 检查 pnpm 是否在 PATH 中，或检查常见安装位置
    local pnpm_found=false
    if command -v pnpm &> /dev/null; then
        pnpm_found=true
    elif [ -f "$HOME/.local/share/pnpm/pnpm" ]; then
        export PNPM_HOME="$HOME/.local/share/pnpm"
        export PATH="$PNPM_HOME:$PATH"
        pnpm_found=true
    elif [ -f "/usr/local/bin/pnpm" ]; then
        export PATH="/usr/local/bin:$PATH"
        pnpm_found=true
    fi
    
    if [ "$pnpm_found" = true ]; then
        local pnpm_version=$(pnpm -v 2>/dev/null || echo "unknown")
        log_success "检测到pnpm: $pnpm_version"
    else
        log_warn "未检测到pnpm，将自动安装"
    fi

    # 检查项目目录
    if [ ! -d "$PROJECT_ROOT" ]; then
        log_error "项目目录不存在: $PROJECT_ROOT"
        exit 1
    fi

    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        log_error "项目目录中不存在package.json"
        exit 1
    fi

    log_success "环境检查完成"
}

################################################################################
# 第2步: 环境初始化
################################################################################

init_environment() {
    log_info "开始环境初始化..."

    # 更新系统包
    if [ "$QUICK_MODE" = false ]; then
        log_info "更新系统包..."
        sudo apt update -qq
    fi

    # 安装基础工具
    log_info "安装基础工具..."
    local packages=("curl" "wget" "git" "build-essential")
    for pkg in "${packages[@]}"; do
        if ! dpkg -l | grep -q "^ii  $pkg"; then
            log_info "安装 $pkg..."
            sudo apt install -y -qq "$pkg"
        fi
    done

    # 安装Node.js (如果未安装)
    if ! command -v node &> /dev/null; then
        log_info "安装Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
        sudo apt install -y -qq nodejs
    fi

    # 安装pnpm (如果未安装)
    # 再次检查 pnpm (可能在之前的步骤中已加载)
    local pnpm_available=false
    if command -v pnpm &> /dev/null; then
        pnpm_available=true
    elif [ -f "$HOME/.local/share/pnpm/pnpm" ]; then
        export PNPM_HOME="$HOME/.local/share/pnpm"
        export PATH="$PNPM_HOME:$PATH"
        if command -v pnpm &> /dev/null; then
            pnpm_available=true
        fi
    fi
    
    if [ "$pnpm_available" = false ]; then
        log_info "安装pnpm..."
        
        # 确保 npm 可用
        if ! command -v npm &> /dev/null; then
            log_error "npm 未安装，无法安装 pnpm"
            log_info "请先安装 Node.js 和 npm"
            exit 1
        fi
        
        # 检查本地安装脚本
        local install_script="$PROJECT_ROOT/install.sh"
        local pnpm_installed=false
        
        # 方法1: 使用本地安装脚本 (优先)
        if [ -f "$install_script" ]; then
            log_info "使用本地安装脚本: $install_script"
            if sh "$install_script"; then
                pnpm_installed=true
                log_success "使用本地脚本安装成功"
            else
                log_warn "本地安装脚本执行失败，尝试其他方法..."
            fi
        else
            log_info "未找到本地安装脚本，尝试从网络下载..."
            # 方法2: 使用网络安装脚本
            if curl -fsSL https://get.pnpm.io/install.sh | sh -s -; then
                pnpm_installed=true
                log_success "使用网络脚本安装成功"
            else
                log_warn "网络安装脚本失败，尝试使用 npm 安装..."
            fi
        fi
        
        # 方法3: 使用 npm 安装 (备用方案)
        if [ "$pnpm_installed" = false ]; then
            log_info "尝试使用 npm 安装 pnpm..."
            if npm install -g pnpm; then
                pnpm_installed=true
                log_success "pnpm 安装成功 (通过 npm)"
            else
                log_error "pnpm 安装失败"
                log_info "请尝试手动安装:"
                if [ -f "$install_script" ]; then
                    log_info "  方法1: sh $install_script"
                else
                    log_info "  方法1: curl -fsSL https://get.pnpm.io/install.sh | sh -"
                fi
                log_info "  方法2: npm install -g pnpm"
                log_info "  方法3: npm install -g pnpm@latest"
                exit 1
            fi
        fi
        
        # 将 pnpm 添加到 PATH (如果使用独立安装)
        if [ -d "$HOME/.local/share/pnpm" ]; then
            export PATH="$HOME/.local/share/pnpm:$PATH"
        fi
        # 重新加载 shell 配置
        if [ -f "$HOME/.bashrc" ]; then
            source "$HOME/.bashrc" 2>/dev/null || true
        fi
        if [ -f "$HOME/.zshrc" ]; then
            source "$HOME/.zshrc" 2>/dev/null || true
        fi
        
        # 等待一下让系统识别新安装的命令
        sleep 1
        
        # 验证安装
        if command -v pnpm &> /dev/null; then
            local pnpm_version=$(pnpm -v 2>/dev/null || echo "unknown")
            log_success "pnpm 安装成功: $pnpm_version"
        else
            log_warn "pnpm 安装后无法立即识别，尝试添加到 PATH..."
            # 尝试多个可能的路径
            for pnpm_path in "$HOME/.local/share/pnpm/pnpm" "/usr/local/bin/pnpm" "$(npm config get prefix)/bin/pnpm"; do
                if [ -f "$pnpm_path" ] || [ -x "$pnpm_path" ]; then
                    export PATH="$(dirname "$pnpm_path"):$PATH"
                    log_info "已添加路径: $(dirname "$pnpm_path")"
                    break
                fi
            done
            
            # 再次验证
            if command -v pnpm &> /dev/null; then
                local pnpm_version=$(pnpm -v 2>/dev/null || echo "unknown")
                log_success "pnpm 现在可用: $pnpm_version"
            else
                log_error "pnpm 安装后仍无法识别"
                log_info "请手动执行以下命令后重新运行脚本:"
                log_info "  export PATH=\"\$HOME/.local/share/pnpm:\$PATH\""
                log_info "  或添加到 ~/.bashrc: echo 'export PATH=\"\$HOME/.local/share/pnpm:\$PATH\"' >> ~/.bashrc"
                exit 1
            fi
        fi
    else
        # pnpm 已可用，验证版本并确保 PATH 正确
        local pnpm_version=$(pnpm -v 2>/dev/null || echo "unknown")
        log_success "检测到 pnpm: $pnpm_version"
        
        # 确保 PATH 已正确设置（用于后续命令）
        if [ -d "$HOME/.local/share/pnpm" ]; then
            export PNPM_HOME="$HOME/.local/share/pnpm"
            export PATH="$PNPM_HOME:$PATH"
        fi
    fi

    # 安装MySQL服务器 (如果未安装)
    if ! command -v mysql &> /dev/null; then
        log_info "安装MySQL服务器..."
        sudo apt install -y -qq mysql-server
        sudo systemctl start mysql
        sudo systemctl enable mysql
    fi

    # 创建应用用户 (如果不存在)
    if ! id "appuser" &>/dev/null; then
        log_info "创建应用用户..."
        sudo useradd -m -s /bin/bash appuser
    fi

    # 创建应用目录
    log_info "创建应用目录..."
    sudo mkdir -p /opt/research-match-system
    sudo chown -R appuser:appuser /opt/research-match-system

    # 创建日志目录
    log_info "创建日志目录..."
    sudo mkdir -p /var/log/research-match-system
    sudo chown -R appuser:appuser /var/log/research-match-system

    # 创建备份目录
    log_info "创建备份目录..."
    sudo mkdir -p /var/backups/research-match-system
    sudo chown -R appuser:appuser /var/backups/research-match-system

    log_success "环境初始化完成"
}

################################################################################
# 第3步: 配置设置
################################################################################

setup_configuration() {
    log_info "开始配置设置..."

    cd "$PROJECT_ROOT"

    # 检查环境变量文件
    local env_file=".env.${ENVIRONMENT}"
    if [ ! -f "$env_file" ]; then
        if [ -f ".env" ]; then
            log_warn "未找到 $env_file，使用 .env 文件"
            env_file=".env"
        elif [ -f ".env.production" ]; then
            log_warn "未找到 $env_file，使用现有的 .env.production 文件"
            env_file=".env.production"
        else
            log_error "未找到环境变量文件"
            log_info "请创建 $env_file 或 .env.production 文件，参考 ENV_CHECKLIST.md"
            log_info "也可以从模板复制: cp config/env.example .env.production"
            exit 1
        fi
    fi

    # 复制环境变量文件（如果源文件和目标文件不同）
    log_info "配置环境变量..."
    if [ "$env_file" != ".env.production" ]; then
        log_info "从 $env_file 复制到 .env.production"
        cp "$env_file" .env.production
        chmod 600 .env.production
    else
        log_info "使用现有的 .env.production 文件"
        chmod 600 .env.production
    fi

    # 验证必需的环境变量
    log_info "验证环境变量..."
    source "$env_file" 2>/dev/null || true

    local required_vars=("DATABASE_URL" "JWT_SECRET" "ADMIN_EMAIL")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "缺少必需的环境变量: $var"
            exit 1
        fi
    done

    log_success "配置设置完成"
}

################################################################################
# 第4步: 数据库初始化
################################################################################

init_database() {
    log_info "开始数据库初始化..."

    cd "$PROJECT_ROOT"

    # 加载环境变量
    if [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
    fi

    # 检查数据库连接
    log_info "检查数据库连接..."
    # 解析连接信息，优先从 DATABASE_URL 获取，避免空密码提示
    DB_USER_EFFECTIVE="${DB_USER:-}"
    DB_PASSWORD_EFFECTIVE="${DB_PASSWORD:-}"
    DB_HOST_EFFECTIVE="${DB_HOST:-}"
    DB_PORT_EFFECTIVE="${DB_PORT:-3306}"
    DB_NAME_EFFECTIVE="${DB_NAME:-}"

    if [ -n "$DATABASE_URL" ]; then
        # 支持 mysql://user:pass@host:port/dbname
        if [[ $DATABASE_URL =~ mysql://([^:]+):([^@]+)@([^:/]+):?([0-9]+)?/([^\?]+) ]]; then
            DB_USER_EFFECTIVE="${BASH_REMATCH[1]}"
            DB_PASSWORD_EFFECTIVE="${BASH_REMATCH[2]}"
            DB_HOST_EFFECTIVE="${BASH_REMATCH[3]}"
            DB_PORT_EFFECTIVE="${BASH_REMATCH[4]:-3306}"
            DB_NAME_EFFECTIVE="${BASH_REMATCH[5]}"
        fi
    fi

    DB_USER_EFFECTIVE="${DB_USER_EFFECTIVE:-app_user}"
    DB_HOST_EFFECTIVE="${DB_HOST_EFFECTIVE:-localhost}"
    DB_NAME_EFFECTIVE="${DB_NAME_EFFECTIVE:-research_match_system}"
    DB_PORT_EFFECTIVE="${DB_PORT_EFFECTIVE:-3306}"

    PASS_ARG=()
    if [ -n "$DB_PASSWORD_EFFECTIVE" ]; then
        PASS_ARG=(-p"$DB_PASSWORD_EFFECTIVE")
    fi

    if ! mysql -u "$DB_USER_EFFECTIVE" "${PASS_ARG[@]}" -h "$DB_HOST_EFFECTIVE" -P "$DB_PORT_EFFECTIVE" "$DB_NAME_EFFECTIVE" -e "SELECT 1;" &>/dev/null; then
        log_warn "数据库连接失败，尝试创建数据库..."

        if [ -n "$DATABASE_URL" ] && [[ $DATABASE_URL =~ mysql://([^:]+):([^@]+)@([^:/]+):?([0-9]+)?/([^\?]+) ]]; then
            local db_user="${BASH_REMATCH[1]}"
            local db_pass="${BASH_REMATCH[2]}"
            local db_host="${BASH_REMATCH[3]}"
            local db_port="${BASH_REMATCH[4]:-3306}"
            local db_name="${BASH_REMATCH[5]}"

            log_info "创建数据库和用户..."
            sudo mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS $db_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$db_user'@'localhost' IDENTIFIED BY '$db_pass';
GRANT ALL PRIVILEGES ON $db_name.* TO '$db_user'@'localhost';
FLUSH PRIVILEGES;
EOF
        fi
    fi

    # 运行数据库迁移
    log_info "运行数据库迁移..."
    ensure_pnpm_available || {
        log_error "pnpm 不可用，无法运行数据库迁移"
        exit 1
    }
    
    # 确保依赖已安装（drizzle-kit 在 devDependencies 中）
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/drizzle-kit" ]; then
        if [ ! -d "node_modules" ]; then
            log_info "检测到 node_modules 不存在，先安装依赖..."
        else
            log_info "检测到 drizzle-kit 未安装，重新安装依赖..."
        fi
        
        # 配置镜像源
        configure_pnpm_registry
        
        pnpm install || {
            log_error "依赖安装失败，无法运行数据库迁移"
            log_info "如果网络问题持续，可以手动配置镜像源:"
            log_info "  pnpm config set registry https://registry.npmmirror.com"
            log_info "  pnpm config set network-timeout 600000"
            exit 1
        }
        
        # 验证 drizzle-kit 是否安装成功
        if [ ! -f "node_modules/.bin/drizzle-kit" ]; then
            log_error "drizzle-kit 安装失败，请检查依赖安装过程"
            exit 1
        fi
    else
        log_info "依赖已安装，跳过安装步骤"
    fi
    
    # 运行数据库迁移（使用 pnpm 运行脚本，pnpm 会自动处理 node_modules/.bin 路径）
    log_info "执行数据库迁移..."
    pnpm db:push || {
        log_error "数据库迁移失败"
        log_info "尝试手动运行: pnpm db:push"
        log_info "或检查 DATABASE_URL 环境变量是否正确配置"
        exit 1
    }

    log_success "数据库初始化完成"
}

################################################################################
# 第5步: 应用构建
################################################################################

build_application() {
    log_info "开始应用构建..."

    cd "$PROJECT_ROOT"

    # 安装依赖（构建需要 devDependencies，如 vite、esbuild）
    log_info "安装项目依赖（包括开发依赖）..."
    ensure_pnpm_available || {
        log_error "pnpm 不可用，无法安装依赖"
        exit 1
    }
    
    # 配置镜像源
    configure_pnpm_registry
    
    # 构建需要 devDependencies（vite、esbuild 等），所以安装所有依赖
    pnpm install || {
        log_error "依赖安装失败"
        log_info "如果网络问题持续，可以手动配置镜像源:"
        log_info "  pnpm config set registry https://registry.npmmirror.com"
        log_info "  pnpm config set network-timeout 600000"
        exit 1
    }

    # 构建应用
    log_info "构建应用..."
    ensure_pnpm_available || {
        log_error "pnpm 不可用，无法构建应用"
        exit 1
    }
    pnpm build || {
        log_error "应用构建失败"
        exit 1
    }

    # 验证构建输出
    if [ ! -d "dist" ]; then
        log_error "构建输出目录不存在"
        exit 1
    fi

    log_success "应用构建完成"
}

################################################################################
# 第6步: 服务启动
################################################################################

start_services() {
    log_info "开始启动服务..."

    cd "$PROJECT_ROOT"

    # 安装PM2 (如果未安装)
    if ! command -v pm2 &> /dev/null; then
        log_info "安装PM2..."
        sudo npm install -g pm2 > /dev/null 2>&1
    fi

    # 创建日志目录（位于项目内，避免权限问题）
    mkdir -p "$PROJECT_ROOT/logs"

    # 创建PM2配置文件（使用 .cjs 扩展名，因为 package.json 中设置了 "type": "module"）
    log_info "配置PM2..."
    # 确保 config 目录存在
    mkdir -p "$PROJECT_ROOT/config"
    
    # PM2 环境变量：把数据库、JWT 等关键变量写进去，防止运行时拿不到
    # 注意：这里假定部署环境已经提前 export 了这些变量，pm2 会在启动时注入
    cat > "$PROJECT_ROOT/config/ecosystem.config.cjs" << 'EOF'
const path = require("path");

module.exports = {
  apps: [
    {
      name: "research-match-system",
      script: "./dist/index.js",
      cwd: path.resolve(__dirname, ".."),
      instances: "max",  // 先使用单实例，稳定后再改为 "max"
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        // 数据库与认证关键变量，需在部署机上预先 export
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        ADMIN_NAME: process.env.ADMIN_NAME,
        DB_POOL_MIN: process.env.DB_POOL_MIN,
        DB_POOL_MAX: process.env.DB_POOL_MAX,
        // 注意：AI/LLM 配置（OPENROUTER_API_KEY 等）不在这里设置
        // 这些变量应该从 .env.production 文件加载，由 env-loader.ts 处理
        // 如果在 env 块中设置为 undefined，会覆盖文件加载的值
      },
      // 将日志写到项目内，避免 /var/log 权限问题
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      max_memory_restart: "1G",
      watch: false,
      ignore_watch: ["node_modules", "dist"],
      max_restarts: 10,
      min_uptime: "10s",
      // 增加启动超时时间
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};
EOF

    # 先停止可能存在的旧实例
    log_info "清理旧实例..."
    pm2 delete research-match-system 2>/dev/null || true
    pm2 kill 2>/dev/null || true
    sleep 1

    # 启动应用
    log_info "启动应用..."
    pm2 start "$PROJECT_ROOT/config/ecosystem.config.cjs" || {
        log_error "应用启动失败"
        log_info "查看错误日志: pm2 logs research-match-system --err"
        exit 1
    }

    # 等待应用启动
    log_info "等待应用启动..."
    sleep 3

    # 检查应用状态
    log_info "检查应用状态..."
    local online_count=$(pm2 jlist | grep -o '"status":"online"' | wc -l || echo "0")
    if [ "$online_count" -eq "0" ]; then
        log_error "没有实例成功启动"
        log_info "查看错误日志:"
        log_info "  pm2 logs research-match-system --err"
        log_info "  tail -n 50 /var/log/research-match-system/error.log"
        exit 1
    elif [ "$online_count" -lt "2" ]; then
        log_warn "只有 $online_count 个实例成功启动，部分实例可能启动失败"
        log_info "查看日志: pm2 logs research-match-system --err"
    else
        log_success "有 $online_count 个实例成功启动"
    fi

    # 设置开机自启
    log_info "设置开机自启..."
    pm2 startup > /dev/null 2>&1
    pm2 save > /dev/null 2>&1

    log_success "服务启动完成"
}

################################################################################
# 第7步: Nginx配置
################################################################################

setup_nginx() {
    log_info "开始Nginx配置..."

    # 安装Nginx (如果未安装)
    if ! command -v nginx &> /dev/null; then
        log_info "安装Nginx..."
        sudo apt install -y -qq nginx
    fi

    # 创建Nginx配置
    log_info "配置Nginx..."
    sudo tee /etc/nginx/sites-available/research-match-system > /dev/null << 'EOF'
upstream research_match_backend {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name _;
    
    access_log /var/log/nginx/research-match-access.log;
    error_log /var/log/nginx/research-match-error.log;

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://research_match_backend;
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
    if [ ! -L /etc/nginx/sites-enabled/research-match-system ]; then
        sudo ln -s /etc/nginx/sites-available/research-match-system \
                   /etc/nginx/sites-enabled/research-match-system
    fi

    # 测试Nginx配置
    if ! sudo nginx -t > /dev/null 2>&1; then
        log_error "Nginx配置测试失败"
        exit 1
    fi

    # 启动Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx

    log_success "Nginx配置完成"
}

################################################################################
# 第8步: 验证检查
################################################################################

verify_deployment() {
    log_info "开始验证检查..."

    # 检查应用状态
    log_info "检查应用状态..."
    if ! pm2 list | grep -q "research-match-system"; then
        log_error "应用未运行"
        exit 1
    fi

    # 等待应用启动
    sleep 2

    # 检查健康状态
    log_info "检查应用健康状态..."
    if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_warn "应用健康检查失败，可能还在启动中"
    fi

    # 检查Nginx状态
    log_info "检查Nginx状态..."
    if ! sudo systemctl is-active --quiet nginx; then
        log_error "Nginx未运行"
        exit 1
    fi

    # 检查数据库连接
    log_info "检查数据库连接..."
    # 优先从 DATABASE_URL 解析，避免 DB_USER/DB_PASSWORD 为空时提示输入密码
    # 支持格式: mysql://user:pass@host:port/dbname
    DB_USER_EFFECTIVE="${DB_USER:-}"
    DB_PASSWORD_EFFECTIVE="${DB_PASSWORD:-}"
    DB_HOST_EFFECTIVE="${DB_HOST:-}"
    DB_PORT_EFFECTIVE="${DB_PORT:-3306}"
    DB_NAME_EFFECTIVE="${DB_NAME:-}"

    if [ -n "$DATABASE_URL" ]; then
        if [[ $DATABASE_URL =~ mysql://([^:]+):([^@]+)@([^:/]+):?([0-9]+)?/([^\?]+) ]]; then
            DB_USER_EFFECTIVE="${BASH_REMATCH[1]}"
            DB_PASSWORD_EFFECTIVE="${BASH_REMATCH[2]}"
            DB_HOST_EFFECTIVE="${BASH_REMATCH[3]}"
            DB_PORT_EFFECTIVE="${BASH_REMATCH[4]:-3306}"
            DB_NAME_EFFECTIVE="${BASH_REMATCH[5]}"
        fi
    fi

    DB_USER_EFFECTIVE="${DB_USER_EFFECTIVE:-app_user}"
    DB_PASSWORD_EFFECTIVE="${DB_PASSWORD_EFFECTIVE:-}"
    DB_HOST_EFFECTIVE="${DB_HOST_EFFECTIVE:-localhost}"
    DB_NAME_EFFECTIVE="${DB_NAME_EFFECTIVE:-research_match_system}"

    if ! mysql -u "$DB_USER_EFFECTIVE" -p"$DB_PASSWORD_EFFECTIVE" -h "$DB_HOST_EFFECTIVE" -P "$DB_PORT_EFFECTIVE" "$DB_NAME_EFFECTIVE" -e "SELECT 1;" &>/dev/null; then
        log_error "数据库连接失败（用户: $DB_USER_EFFECTIVE，主机: $DB_HOST_EFFECTIVE，端口: $DB_PORT_EFFECTIVE，库: $DB_NAME_EFFECTIVE）"
        exit 1
    fi

    log_success "验证检查完成"
}

################################################################################
# 主函数
################################################################################

main() {
    log_info "=========================================="
    log_info "智研匹配系统 - 一键部署脚本"
    log_info "=========================================="
    log_info "环境: $ENVIRONMENT"
    log_info "快速模式: $QUICK_MODE"
    log_info "项目目录: $PROJECT_ROOT"
    log_info "=========================================="

    # 如果仅初始化环境
    if [ "$ENV_ONLY" = true ]; then
        check_environment
        init_environment
        log_success "环境初始化完成"
        exit 0
    fi

    # 完整部署流程
    check_environment
    init_environment
    setup_configuration
    init_database
    build_application
    start_services
    setup_nginx
    verify_deployment

    log_success "=========================================="
    log_success "部署完成！"
    log_success "=========================================="
    log_info "应用地址: http://localhost"
    log_info "应用日志: pm2 logs research-match-system"
    log_info "查看状态: pm2 status"
    log_info "停止应用: pm2 stop research-match-system"
    log_info "重启应用: pm2 restart research-match-system"
    log_success "=========================================="
}

# 运行主函数
main "$@"
