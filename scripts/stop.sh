#!/bin/bash

################################################################################
# 智研匹配系统 - 停止脚本
#
# 使用方法:
#   chmod +x scripts/stop.sh
#   ./scripts/stop.sh
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

log_info "停止智研匹配系统..."

# 停止应用
if command -v pm2 &> /dev/null; then
    log_info "停止应用..."
    pm2 stop research-match-system || log_warn "应用未运行"
    log_success "应用已停止"
else
    log_warn "PM2未安装"
fi

# 停止Nginx
log_info "停止Nginx..."
sudo systemctl stop nginx || log_warn "Nginx未运行"
log_success "Nginx已停止"

log_success "系统已停止"
