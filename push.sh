#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}📦 推送代码到 GitHub${NC}"
echo -e "${BLUE}========================================${NC}"

# 显示远程仓库
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo -e "${RED}❌ 错误：未配置远程仓库${NC}"
    exit 1
fi
echo -e "${BLUE}📍 远程仓库: ${REMOTE_URL}${NC}"
echo ""

# 添加所有更改
echo -e "${GREEN}1️⃣  添加所有更改...${NC}"
git add .

# 检查是否有更改
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  没有需要提交的更改${NC}"
    exit 0
fi

# 获取提交信息
if [ -z "$1" ]; then
    COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

# 提交
echo -e "${GREEN}2️⃣  提交更改: ${COMMIT_MSG}${NC}"
git commit -m "$COMMIT_MSG"

# 推送到 GitHub
echo -e "${GREEN}3️⃣  推送到 ${REMOTE_URL}...${NC}"
echo -e "${YELLOW}💡 提示：如果需要输入用户名和密码，请使用 GitHub Personal Access Token${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 推送成功！${NC}"
    echo -e "${BLUE}🔗 查看仓库: https://github.com/geeme1/new-api${NC}"
else
    echo ""
    echo -e "${RED}❌ 推送失败${NC}"
    echo -e "${YELLOW}💡 可能的原因：${NC}"
    echo -e "   1. 需要配置 GitHub 认证（Personal Access Token）"
    echo -e "   2. 网络连接问题"
    echo -e "   3. 没有推送权限"
    exit 1
fi
