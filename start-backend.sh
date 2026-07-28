#!/bin/bash

echo "=== 启动字幕控制系统后端 ==="

# 检查后端目录是否存在
if [ ! -d "server" ]; then
    echo "错误: server 目录不存在"
    exit 1
fi

# 进入后端目录
cd server

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "安装后端依赖..."
    npm install
fi

# 检查是否已有后端进程在运行
if pgrep -f "node server.js" > /dev/null; then
    echo "停止现有后端进程..."
    pkill -f "node server.js"
    sleep 2
fi

# 启动后端服务器
echo "启动后端服务器..."
nohup node server.js > server.log 2>&1 &
BACKEND_PID=$!

# 等待服务器启动
echo "等待服务器启动..."
sleep 3

# 检查服务器是否启动成功
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✓ 后端服务器启动成功 (PID: $BACKEND_PID)"
    echo "后端地址: http://localhost:3001"
    echo "日志文件: server/server.log"
    echo ""
    echo "使用以下命令查看日志:"
    echo "  tail -f server/server.log"
    echo ""
    echo "使用以下命令停止后端:"
    echo "  pkill -f 'node server.js'"
else
    echo "✗ 后端服务器启动失败"
    echo "请检查日志文件: server/server.log"
    exit 1
fi 