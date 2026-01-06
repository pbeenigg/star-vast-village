#!/bin/bash

# ========================================
# TOD社区小程序 - 项目初始化脚本
# ========================================

set -e

echo "========================================="
echo "TOD社区小程序 - 项目初始化"
echo "========================================="
echo ""

# 检查Node.js版本
echo "检查Node.js版本..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: 需要Node.js 18或更高版本"
    echo "当前版本: $(node -v)"
    exit 1
fi
echo "✅ Node.js版本检查通过: $(node -v)"
echo ""

# 初始化后端项目
echo "========================================="
echo "1. 初始化后端项目"
echo "========================================="
cd backend

if [ ! -f ".env" ]; then
    echo "创建后端环境变量文件..."
    cp .env.development .env
    echo "⚠️  请编辑 backend/.env 文件，填入正确的配置信息"
else
    echo "✅ 后端环境变量文件已存在"
fi

echo "安装后端依赖..."
npm install
echo "✅ 后端依赖安装完成"
echo ""

# 初始化前端项目
echo "========================================="
echo "2. 初始化前端项目"
echo "========================================="
cd ../frontend

if [ ! -f ".env.development" ]; then
    echo "⚠️  前端环境变量文件不存在，请手动创建"
else
    echo "✅ 前端环境变量文件已存在"
fi

echo "安装前端依赖..."
npm install
echo "✅ 前端依赖安装完成"
echo ""

# 返回项目根目录
cd ..

echo "========================================="
echo "初始化完成！"
echo "========================================="
echo ""
echo "下一步操作："
echo "1. 配置Supabase数据库"
echo "   - 访问 https://supabase.com 创建项目"
echo "   - 在SQL Editor中执行 scripts/init-database.sql"
echo "   - 获取项目URL和API密钥"
echo ""
echo "2. 配置环境变量"
echo "   - 编辑 backend/.env"
echo "   - 编辑 frontend/.env.development"
echo ""
echo "3. 启动开发服务器"
echo "   - 后端: cd backend && npm run dev"
echo "   - 前端: cd frontend && npm run dev:weapp"
echo ""
echo "详细文档请查看: docs/QUICK_START.md"
echo ""
