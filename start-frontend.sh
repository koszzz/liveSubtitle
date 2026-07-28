#!/bin/bash

echo "=== 启动字幕控制系统前端 ==="

# 检查 package.json 是否存在
if [ ! -f "package.json" ]; then
    echo "错误: package.json 不存在，请确保在项目根目录运行此脚本"
    exit 1
fi

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install --legacy-peer-deps
fi

# 检查后端是否正在运行
echo "检查后端服务器状态..."
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "警告: 后端服务器未运行"
    echo "请先运行 ./start-backend.sh 启动后端"
    echo ""
    read -p "是否继续启动前端? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✓ 后端服务器正在运行"
fi

# 检查是否已有前端进程在运行
if pgrep -f "vite" > /dev/null; then
    echo "停止现有前端进程..."
    pkill -f "vite"
    sleep 2
fi

# 启动前端开发服务器
echo "启动前端开发服务器..."
echo "前端将在浏览器中自动打开..."
echo ""

# 启动前端服务器
npm run dev 