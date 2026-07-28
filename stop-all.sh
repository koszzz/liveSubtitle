#!/bin/bash

echo "=== 停止字幕控制系统 ==="

# 停止前端进程
echo "停止前端进程..."
if pgrep -f "vite" > /dev/null; then
    pkill -f "vite"
    echo "✓ 前端进程已停止"
else
    echo "前端进程未运行"
fi

# 停止后端进程
echo "停止后端进程..."
if pgrep -f "node server.js" > /dev/null; then
    pkill -f "node server.js"
    echo "✓ 后端进程已停止"
else
    echo "后端进程未运行"
fi

echo ""
echo "所有服务已停止" 