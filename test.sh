#!/bin/bash

echo "=== 字幕控制系统测试 ==="
echo ""

# 测试后端健康检查
echo "1. 测试后端健康检查..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "   ✓ 后端服务器运行正常"
else
    echo "   ✗ 后端服务器未运行"
    exit 1
fi

# 测试字幕数据API
echo "2. 测试字幕数据API..."
SUBTITLE_COUNT=$(curl -s http://localhost:3001/api/subtitles | jq length 2>/dev/null || echo "0")
if [ "$SUBTITLE_COUNT" -gt 0 ]; then
    echo "   ✓ 找到 $SUBTITLE_COUNT 个字幕文件"
else
    echo "   ✗ 未找到字幕文件"
fi

# 测试过滤器配置API
echo "3. 测试过滤器配置API..."
FILTER_CONFIG=$(curl -s http://localhost:3001/api/filter-config)
if [ "$FILTER_CONFIG" != "{}" ] && [ "$FILTER_CONFIG" != "" ]; then
    echo "   ✓ 过滤器配置加载成功"
else
    echo "   ✗ 过滤器配置加载失败"
fi

# 测试前端服务器
echo "4. 测试前端服务器..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "   ✓ 前端服务器运行正常"
else
    echo "   ✗ 前端服务器未运行"
    exit 1
fi

# 测试展示页面
echo "5. 测试展示页面..."
if curl -s http://localhost:5173/subtitle > /dev/null; then
    echo "   ✓ 展示页面可访问"
else
    echo "   ✗ 展示页面无法访问"
    exit 1
fi

echo ""
echo "=== 测试完成 ==="
echo "控制端地址: http://localhost:5173"
echo "展示端地址: http://localhost:5173/subtitle"
echo "后端地址: http://localhost:3001"
echo ""
echo "如果所有测试都通过，你可以在浏览器中访问前端地址来使用系统。" 