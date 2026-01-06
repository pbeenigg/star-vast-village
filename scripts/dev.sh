#!/bin/bash

# ========================================
# TOD社区小程序 - 开发服务器启动脚本
# ========================================

set -e

echo "========================================="
echo "TOD社区小程序 - 启动开发服务器"
echo "========================================="
echo ""

# 检查是否在项目根目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 启动后端服务器
echo "启动后端服务器..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "✅ 后端服务器已启动 (PID: $BACKEND_PID)"
echo "   访问: http://localhost:3000"
echo ""

# 等待后端启动
sleep 3

# 启动前端服务器
echo "启动前端服务器..."
cd ../frontend
npm run dev:weapp &
FRONTEND_PID=$!
echo "✅ 前端服务器已启动 (PID: $FRONTEND_PID)"
echo ""

echo "========================================="
echo "开发服务器已启动"
echo "========================================="
echo "后端: http://localhost:3000"
echo "前端: 请在微信开发者工具中打开 frontend/dist 目录"
echo ""
echo "按 Ctrl+C 停止所有服务器"
echo ""

# 等待用户中断
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM

wait
