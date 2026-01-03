#!/bin/bash

################################################################################
# 智研匹配系统 - 快速启动脚本
#
# 使用方法:
#   chmod +x scripts/start.sh
#   ./scripts/start.sh
#
# 说明:
#   此脚本用于启动已部署的应用
#   如果应用未部署，请先运行 deploy.sh
#
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

log_info "启动智研匹配系统..."

cd "$PROJECT_ROOT"

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    log_error "PM2未安装，请先运行部署脚本"
    exit 1
fi

# 检查应用是否已启动
if pm2 list | grep -q "research-match-system"; then
    log_warn "应用已在运行，尝试重启..."
    pm2 restart research-match-system
else
    log_info "启动应用..."
    # 确保日志目录存在
    mkdir -p "$PROJECT_ROOT/logs"
    # 优先使用 config/ 目录中的配置文件
    if [ -f "config/ecosystem.config.cjs" ]; then
        pm2 start config/ecosystem.config.cjs
    elif [ -f "ecosystem.config.cjs" ]; then
        pm2 start ecosystem.config.cjs
    elif [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
    else
        log_error "未找到 PM2 配置文件"
        exit 1
    fi
fi

# 等待应用启动
sleep 2

# 检查应用状态
if pm2 list | grep -q "research-match-system"; then
    log_success "应用已启动"
else
    log_error "应用启动失败"
    exit 1
fi

# 启动Nginx
log_info "启动Nginx..."
sudo systemctl start nginx

# 等待Nginx启动
sleep 1

# 检查Nginx状态
if sudo systemctl is-active --quiet nginx; then
    log_success "Nginx已启动"
else
    log_error "Nginx启动失败"
    exit 1
fi

log_success "=========================================="
log_success "系统已启动！"
log_success "=========================================="
log_info "应用地址: http://localhost:3000/login"
log_info "应用日志: pm2 logs research-match-system"
log_info "查看状态: pm2 status"
log_success "=========================================="
