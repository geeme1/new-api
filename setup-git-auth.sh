#!/bin/bash

echo "🔐 配置 GitHub 认证"
echo ""
echo "请按照以下步骤操作："
echo ""
echo "1. 访问 https://github.com/settings/tokens"
echo "2. 点击 'Generate new token' -> 'Generate new token (classic)'"
echo "3. 勾选 'repo' 权限"
echo "4. 生成 token 并复制"
echo ""
read -p "请输入你的 GitHub Personal Access Token: " TOKEN
read -p "请输入你的 GitHub 用户名: " USERNAME

# 配置 git credential
git config --global credential.helper store
echo "https://${USERNAME}:${TOKEN}@github.com" > ~/.git-credentials

echo ""
echo "✅ 认证配置完成！现在可以使用 ./push.sh 推送代码了"
