#!/bin/bash

echo "=== 字幕控制系统状态检查 ==="
echo ""

# 检查后端状态
echo "后端服务器状态:"
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "  ✓ 运行中 (http://localhost:3001)"
    
    # 检查字幕文件
    SUBTITLE_COUNT=$(curl -s http://localhost:3001/api/subtitles | jq '. | length' 2>/dev/null || echo "0")
    echo "  ✓ 字幕文件数量: $SUBTITLE_COUNT"
else
    echo "  ✗ 未运行"
fi

echo ""

# 检查前端状态
echo "前端服务器状态:"
if curl -s http://localhost:5173 > /dev/null; then
    echo "  ✓ 运行中 (http://localhost:5173)"
    
    # 检查展示页面
    if curl -s http://localhost:5173/subtitle > /dev/null; then
        echo "  ✓ 展示页面可访问 (http://localhost:5173/subtitle)"
    else
        echo "  ✗ 展示页面无法访问"
    fi
else
    echo "  ✗ 未运行"
fi

echo ""

# 检查进程
echo "进程状态:"
BACKEND_PID=$(pgrep -f "node server.js")
if [ ! -z "$BACKEND_PID" ]; then
    echo "  ✓ 后端进程: $BACKEND_PID"
else
    echo "  ✗ 后端进程: 未运行"
fi

FRONTEND_PID=$(pgrep -f "vite")
if [ ! -z "$FRONTEND_PID" ]; then
    echo "  ✓ 前端进程: $FRONTEND_PID"
else
    echo "  ✗ 前端进程: 未运行"
fi

echo ""
echo "=== 状态检查完成 ===" 