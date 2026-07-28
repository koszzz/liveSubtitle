#!/bin/bash

# 启动后端服务器
echo "启动后端服务器..."
cd server
nohup node server.js > server.log 2>&1 &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 2

# 检查后端是否启动成功
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "后端服务器启动成功 (PID: $BACKEND_PID)"
else
    echo "后端服务器启动失败"
    exit 1
fi

# 启动前端服务器
echo "启动前端服务器..."
npm run dev &
FRONTEND_PID=$!

echo "前端服务器启动成功 (PID: $FRONTEND_PID)"
echo ""
echo "服务器地址:"
echo "  前端: http://localhost:5173"
echo "  后端: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务器"

# 等待用户中断
wait 