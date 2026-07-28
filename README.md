# 字幕控制系统

一个基于Vue 3 + Vite + TypeScript的字幕控制网站，专为小窗口设计，信息密度高，无滚动条。支持从真实字幕文件读取数据。

## 功能特性

### 1. 控制端
- Adobe Premiere Pro风格的时间轴界面
- 时间刻度在上方，轨道在下方
- 双轨道设计（轨道1和轨道2，通常使用轨道1）
- 实时播放头显示
- 点击字幕块快速定位到指定时间
- 自动播放功能
- 紧凑设计，适合小窗口
- 键盘控制支持（方向键和A/S键）

### 2. 展示端
- 1920x1080 全屏展示页面
- 双轨道字幕显示（轨道1和轨道2）
- 使用 JavascriptSubtitlesOctopus 4.1.0 渲染 ASS 字幕
- 动态加载字体文件，支持 TTF、OTF、TTC、WOFF 格式
- 内部计时器同步，减少网络通信
- Socket.io 事件驱动通信
- 透明背景，适合 OBS 叠加

### 3. 字幕选择
- 基于JSON配置的预设条件快速筛选
- 简化的文件描述，只显示名称和预览文本
- 高信息密度设计
- 选择文件后自动开始播放
- 从真实字幕文件读取数据

### 4. 界面特性
- 紧凑布局，适合小窗口显示
- 时间轴在上，字幕选择在下
- 无页面滚动条，完美适配窗口
- 现代化UI（使用自定义CSS）
- 实时状态显示

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **样式**: 自定义CSS
- **UI组件**: Headless UI + Heroicons
- **后端**: Node.js + Express + Socket.io
- **数据源**: 真实字幕文件
- **实时通信**: Socket.io
- **字幕渲染**: JavascriptSubtitlesOctopus

## 项目结构

```
liveSubtitle_new/
├── src/                 # 前端源码
│   ├── components/      # 组件
│   │   ├── Timeline.vue     # 时间轴组件
│   │   └── SubtitleSelector.vue # 字幕选择器
│   ├── views/           # 页面
│   │   └── HomeView.vue     # 主页面
│   ├── stores/          # 状态管理
│   │   └── subtitle.ts      # 字幕状态
│   ├── types/           # 类型定义
│   │   └── subtitle.ts      # 字幕相关类型
│   ├── data/            # 数据层
│   │   └── api.ts           # API数据获取
│   └── assets/          # 静态资源
│       └── main.css         # 主样式文件
├── server/              # 后端服务器
│   ├── server.js        # 主服务器文件
│   └── package.json     # 后端依赖
├── subtitleFiles/       # 字幕文件目录
│   ├── filter-config.json # 过滤器配置文件
│   └── 歌曲名/          # 每个歌曲一个文件夹
│       ├── config.txt   # 字幕配置文件
│       ├── subtitle.ass # ASS字幕文件
│       └── lyrics.txt   # 歌词文件
├── start.sh             # 启动脚本
└── package.json         # 前端依赖
```

## 字幕文件格式

### 文件夹结构
每个歌曲在 `subtitleFiles` 目录下有一个独立的文件夹，文件夹名称即为歌曲名。

### 字体文件
字体文件放置在 `public/fonts/` 目录下，支持以下格式：
- TTF (.ttf)
- OTF (.otf) 
- TTC (.ttc)
- WOFF (.woff)
- WOFF2 (.woff2)

系统会自动扫描并加载所有字体文件到 JavascriptSubtitlesOctopus 中。

### config.txt 格式
每行包含以下数据，用逗号分隔：
```
轨道编号,开始时间,结束时间,歌词文本
```

示例：
```
1,0:00:16.36,0:00:21.14,こんなとこじゃ終われないよ
1,0:00:21.63,0:00:26.08,一滴だけこぼす想い
```

- **轨道编号**: 1 或 2，表示字幕显示的轨道
- **开始时间**: 格式为 `小时:分钟:秒.毫秒`
- **结束时间**: 格式为 `小时:分钟:秒.毫秒`
- **歌词文本**: 该时间段的歌词内容

### filter-config.json 格式
定义艺术家和对应的歌曲列表：
```json
{
  "CatChu!": ["全力ライオット"]
}
```

## 数据格式

### 字幕文件 (SubtitleFile)
```typescript
interface SubtitleFile {
  id: string
  name: string
  duration: number
  blocks: SubtitleBlock[]
  createdAt: string
  updatedAt: string
}
```

### 字幕块 (SubtitleBlock)
```typescript
interface SubtitleBlock {
  id: string
  startTime: number
  endTime: number
  text: string
  track: number // 1 或 2，通常使用轨道1
}
```

## 安装和运行

### 方法一：分别启动（推荐）

1. 安装依赖：
```bash
# 安装前端依赖
npm install --legacy-peer-deps

# 安装后端依赖
cd server && npm install && cd ..
```

2. 启动后端服务器：
```bash
./start-backend.sh
```

3. 启动前端服务器（新终端）：
```bash
./start-frontend.sh
```

### 方法二：一键启动

1. 安装依赖：
```bash
npm install --legacy-peer-deps
cd server && npm install && cd ..
```

2. 启动所有服务：
```bash
./start.sh
```

### 停止服务

```bash
# 停止所有服务
./stop-all.sh

# 或者分别停止
pkill -f "node server.js"  # 停止后端
pkill -f "vite"           # 停止前端
```

### 检查服务状态

```bash
# 检查所有服务状态
./status.sh
```

### 访问应用
- 控制端: http://localhost:5173
- 展示端: http://localhost:5173/subtitle
- 后端API: http://localhost:3001

## API 端点

- `GET /api/subtitles` - 获取所有字幕文件
- `GET /api/subtitles/:id` - 获取单个字幕文件
- `GET /api/filter-config` - 获取过滤器配置
- `GET /api/subtitle-file/:id` - 获取 ASS 字幕文件
- `GET /api/fonts` - 获取字体文件列表
- `GET /api/health` - 健康检查

## Socket.io 事件

- `play-state-change` - 播放状态变化（播放/暂停）
- `time-sync` - 时间同步（跳转、暂停时的时间点）
- `file-selected` - 文件选择事件

## 键盘控制

- **轨道1**:
  - `←` (左方向键): 隐藏当前字幕，回到开始时间，暂停
  - `↓` (下方向键): 播放下一条字幕，自动播放
- **轨道2**:
  - `A` 键: 隐藏当前字幕，回到开始时间，暂停
  - `S` 键: 播放下一条字幕，自动播放

## 添加新字幕

1. 在 `subtitleFiles` 目录下创建新文件夹，文件夹名为歌曲名
2. 在文件夹中创建 `config.txt` 文件
3. 按照上述格式编写字幕数据
4. 在 `filter-config.json` 中添加艺术家和歌曲的对应关系
5. 重启后端服务器或刷新前端页面

## 示例数据

项目包含真实字幕文件：
- `全力ライオット` (CatChu!) - 包含55个字幕块，总时长约3分钟