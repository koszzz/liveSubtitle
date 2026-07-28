const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;

// 启用 CORS
app.use(cors());
app.use(express.json());

// 将时间字符串转换为秒数
function timeToSeconds(timeStr) {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parseFloat(parts[2]);
  return hours * 3600 + minutes * 60 + seconds;
}

// 读取单个字幕文件
function loadSubtitleFile(folderPath, songName) {
  const configPath = path.join(folderPath, 'config.txt');
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`配置文件不存在: ${configPath}`);
  }

  const content = fs.readFileSync(configPath, 'utf-8');
  const lines = content.trim().split('\n');
  
  const blocks = [];
  let maxEndTime = 0;

  lines.forEach((line, index) => {
    const parts = line.split(',');
    if (parts.length >= 4) {
      const track = parseInt(parts[0]);
      const startTime = timeToSeconds(parts[1]);
      const endTime = timeToSeconds(parts[2]);
      const text = parts.slice(3).join(','); // 合并剩余部分作为歌词文本
      
      blocks.push({
        id: `${songName}-${index + 1}`,
        startTime,
        endTime,
        text,
        track
      });
      
      maxEndTime = Math.max(maxEndTime, endTime);
    }
  });

  return {
    id: songName,
    name: songName,
    duration: maxEndTime,
    blocks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// 读取过滤器配置
function loadFilterConfig() {
  const configPath = path.join(__dirname, '..', 'subtitleFiles', 'filter-config.json');
  
  if (!fs.existsSync(configPath)) {
    console.warn('过滤器配置文件不存在，返回空配置');
    return {};
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('读取过滤器配置失败:', error);
    return {};
  }
}

// 读取所有字幕文件
function loadAllSubtitleFiles() {
  const subtitleFilesDir = path.join(__dirname, '..', 'subtitleFiles');
  
  if (!fs.existsSync(subtitleFilesDir)) {
    console.warn('subtitleFiles 文件夹不存在');
    return [];
  }

  const songFolders = fs.readdirSync(subtitleFilesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const subtitleFiles = [];

  songFolders.forEach(songName => {
    try {
      const folderPath = path.join(subtitleFilesDir, songName);
      const subtitleFile = loadSubtitleFile(folderPath, songName);
      subtitleFiles.push(subtitleFile);
    } catch (error) {
      console.error(`读取字幕文件失败 ${songName}:`, error);
    }
  });

  return subtitleFiles;
}

// API 路由：获取所有字幕文件
app.get('/api/subtitles', (req, res) => {
  try {
    const subtitleFiles = loadAllSubtitleFiles();
    res.json(subtitleFiles);
  } catch (error) {
    console.error('获取字幕文件失败:', error);
    res.status(500).json({ error: '获取字幕文件失败' });
  }
});

// API 路由：获取单个字幕文件
app.get('/api/subtitles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const subtitleFiles = loadAllSubtitleFiles();
    const subtitleFile = subtitleFiles.find(file => file.id === id);
    
    if (!subtitleFile) {
      return res.status(404).json({ error: '字幕文件不存在' });
    }
    
    res.json(subtitleFile);
  } catch (error) {
    console.error('获取字幕文件失败:', error);
    res.status(500).json({ error: '获取字幕文件失败' });
  }
});

// API 路由：获取过滤器配置
app.get('/api/filter-config', (req, res) => {
  try {
    const filterConfig = loadFilterConfig();
    res.json(filterConfig);
  } catch (error) {
    console.error('获取过滤器配置失败:', error);
    res.status(500).json({ error: '获取过滤器配置失败' });
  }
});

// API 路由：获取字体文件列表
app.get('/api/fonts', (req, res) => {
  try {
    const fontsDir = path.join(__dirname, '..', 'public', 'fonts');
    
    if (!fs.existsSync(fontsDir)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(fontsDir);
    const fontFiles = files.filter(file => {
      const ext = file.toLowerCase();
      return ext.endsWith('.ttf') || ext.endsWith('.otf') || ext.endsWith('.ttc') || 
             ext.endsWith('.woff') || ext.endsWith('.woff2');
    });
    
    console.log('找到字体文件:', fontFiles);
    res.json(fontFiles);
  } catch (error) {
    console.error('获取字体列表失败:', error);
    res.status(500).json({ error: '获取字体列表失败' });
  }
});

// API 路由：获取 ASS 字幕文件
app.get('/api/subtitle-file/:id', (req, res) => {
  try {
    const { id } = req.params;
    const subtitleFilesDir = path.join(__dirname, '..', 'subtitleFiles');
    const filePath = path.join(subtitleFilesDir, id, 'subtitle.ass');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'ASS 字幕文件不存在' });
    }
    
    const assContent = fs.readFileSync(filePath, 'utf-8');
    res.setHeader('Content-Type', 'text/plain');
    res.send(assContent);
  } catch (error) {
    console.error('获取 ASS 字幕文件失败:', error);
    res.status(500).json({ error: '获取 ASS 字幕文件失败' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '字幕服务器运行正常' });
});

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log('客户端已连接:', socket.id);
  
  socket.on('play-state-change', (data) => {
    console.log('收到播放状态变化事件:', data);
    // 广播给所有客户端
    socket.broadcast.emit('play-state-change', data);
  });
  
  socket.on('time-sync', (data) => {
    console.log('收到时间同步事件:', data);
    // 广播给所有客户端
    socket.broadcast.emit('time-sync', data);
  });
  
  socket.on('file-selected', (data) => {
    console.log('收到文件选择事件:', data);
    // 广播给所有客户端
    socket.broadcast.emit('file-selected', data);
  });
  
  socket.on('ass-content-update', (data) => {
    console.log('收到ASS文件更新事件:', data);
    // 广播给所有客户端
    socket.broadcast.emit('ass-content-update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('客户端已断开连接:', socket.id);
  });
});

// 广播字幕更新事件
function broadcastSubtitleUpdate(data) {
  io.emit('subtitle-update', data);
}

// 广播文件选择事件
function broadcastFileSelected(file) {
  io.emit('file-selected', { file });
}

server.listen(PORT, () => {
  console.log(`字幕服务器运行在 http://localhost:${PORT}`);
  console.log(`API 端点:`);
  console.log(`  GET /api/subtitles - 获取所有字幕文件`);
  console.log(`  GET /api/subtitles/:id - 获取单个字幕文件`);
  console.log(`  GET /api/filter-config - 获取过滤器配置`);
  console.log(`  GET /api/subtitle-file/:id - 获取 ASS 字幕文件`);
  console.log(`  GET /api/health - 健康检查`);
  console.log(`Socket.io 已启用`);
}); 