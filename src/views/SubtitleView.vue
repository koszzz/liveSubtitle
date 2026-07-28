<template>
  <div class="subtitle-view">
    <!-- 字幕容器 -->
    <div class="subtitle-container">
      <canvas ref="canvas" class="subtitle-canvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { io, Socket } from 'socket.io-client'
import type { SubtitleFile } from '@/types/subtitle'
import { loadFonts } from '@/utils/fontLoader'

const canvas = ref<HTMLCanvasElement>()
const currentTime = ref(0)
const isPlaying = ref(false)
const selectedFile = ref<SubtitleFile | null>(null)

let socket: Socket | null = null
let subtitleRenderer: any = null
let internalTimer: number | null = null

// 初始化 Socket.io 连接
const initSocket = () => {
  console.log('初始化 Socket.io 连接...')
  socket = io('http://localhost:3001', {
    transports: ['websocket', 'polling']
  })

  socket.on('connect', () => {
    console.log('展示端已连接到服务器，Socket ID:', socket.id)
  })

  socket.on('play-state-change', (data) => {
    console.log('收到播放状态变化:', data)
    isPlaying.value = data.isPlaying

    if (data.isPlaying) {
      startInternalTimer()
    } else {
      stopInternalTimer()
    }
  })

  socket.on('time-sync', (data) => {
    console.log('收到时间同步:', data)
    currentTime.value = data.currentTime
    updateSubtitles()
    
    // 如果正在播放，重置计时器以使用新的起始时间
    if (isPlaying.value) {
      startInternalTimer()
    }
  })

  socket.on('ass-content-update', (data) => {
    console.log('收到ASS文件更新:', data)
    console.log('ASS内容长度:', data.assContent ? data.assContent.length : '无内容')
    if (data.assContent) {
      console.log('开始重新初始化字幕渲染器...')
      // 保存当前播放状态
      const wasPlaying = isPlaying.value
      const currentTimeBeforeUpdate = currentTime.value
      
      // 重新初始化字幕渲染器
      initSubtitleRenderers(data.assContent).then(() => {
        // 恢复播放状态和时间
        if (wasPlaying) {
          console.log('恢复播放状态，当前时间:', currentTimeBeforeUpdate)
          currentTime.value = currentTimeBeforeUpdate
          updateSubtitles()
          startInternalTimer()
        }
      })
    } else {
      console.error('ASS文件内容为空')
    }
  })

  socket.on('file-selected', (data) => {
    console.log('收到文件选择:', data)
    selectedFile.value = data.file
    loadSubtitleFile(data.file)
  })

  socket.on('disconnect', () => {
    console.log('与服务器断开连接')
    stopInternalTimer()
  })

  socket.on('connect_error', (error) => {
    console.error('Socket.io 连接错误:', error)
  })


}

// 加载字幕文件
const loadSubtitleFile = async (file: SubtitleFile) => {
  if (!file) return

  try {
    console.log('加载字幕文件:', file.id)
    const response = await fetch(`http://localhost:3001/api/subtitle-file/${file.id}`)
    if (!response.ok) {
      console.error('获取字幕文件失败:', response.status)
      return
    }

    const assContent = await response.text()
    console.log('ASS 文件内容长度:', assContent.length)
    console.log('ASS 文件内容前500字符:', assContent.substring(0, 500))

    await initSubtitleRenderers(assContent)

    // 重置时间
    currentTime.value = 0
    updateSubtitles()

  } catch (error) {
    console.error('加载字幕文件失败:', error)
  }
}

// 初始化字幕渲染器
const initSubtitleRenderers = async (assContent: string): Promise<void> => {
  if (!canvas.value) return

  console.log('初始化字幕渲染器')

  // 清理旧的渲染器
  if (subtitleRenderer) {
    subtitleRenderer.dispose()
  }

  return new Promise((resolve, reject) => {
    try {
      // 设置 Canvas 分辨率为 1920x1080
      if (canvas.value) {
        canvas.value.width = 1920
        canvas.value.height = 1080
        console.log('Canvas 分辨率设置为: 1920x1080')
      }
      
      // 动态加载字体文件
      loadFonts().then(fonts => {
        console.log('加载的字体文件:', fonts)
        console.log('字体文件数量:', fonts.length)
        
        // 创建新的渲染器
        subtitleRenderer = new (window as any).SubtitlesOctopus({
          canvas: canvas.value,
          subContent: assContent,
          fonts: fonts,
          workerUrl: '/js/subtitles-octopus-worker.js',
          legacyWorkerUrl: '/js/subtitles-octopus-worker-legacy.js',
          debug: true, // 开启调试模式
          onReady: () => {
            console.log('字幕渲染器就绪')
            resolve()
          },
          onError: (error: any) => {
            console.error('字幕渲染器错误:', error)
            console.error(error)
            reject(error)
          }
        })

        console.log('字幕渲染器初始化完成')
      }).catch(error => {
        console.error('加载字体失败:', error)
        reject(error)
      })
    } catch (error) {
      console.error('初始化字幕渲染器失败:', error)
      reject(error)
    }
  })
}

// 启动内部计时器
const startInternalTimer = () => {
  if (internalTimer) {
    stopInternalTimer()
  }

  console.log('启动内部计时器')
  const startTime = Date.now()
  const startCurrentTime = currentTime.value
  
  internalTimer = window.setInterval(() => {
    if (isPlaying.value && selectedFile.value) {
      // 基于实际时间计算，确保精确性
      const elapsed = (Date.now() - startTime) / 1000
      currentTime.value = startCurrentTime + elapsed
      
      if (currentTime.value > selectedFile.value.duration) {
        currentTime.value = selectedFile.value.duration
        stopInternalTimer()
      }
      updateSubtitles()
    }
  }, 16) // 约60fps (1000ms / 60 ≈ 16.67ms)
}

// 停止内部计时器
const stopInternalTimer = () => {
  if (internalTimer) {
    console.log('停止内部计时器')
    clearInterval(internalTimer)
    internalTimer = null
  }
}

// 更新字幕显示
const updateSubtitles = () => {
  try {
    console.log('尝试更新字幕，当前时间:', currentTime.value)
    console.log('渲染器状态:', subtitleRenderer ? '存在' : '不存在')
    
    if (subtitleRenderer) {
      console.log('设置字幕时间:', currentTime.value)
      subtitleRenderer.setCurrentTime(currentTime.value) // 使用秒
    } else {
      console.log('渲染器未就绪')
    }
    
    console.log('更新字幕时间完成:', currentTime.value)
  } catch (error) {
    console.error('更新字幕失败:', error)
  }
}

onMounted(() => {
  console.log('展示端组件挂载')
  const script = document.createElement('script')
  script.src = '/js/subtitles-octopus.js'
  script.onload = () => {
    console.log('JavascriptSubtitlesOctopus 加载完成')
    initSocket()
  }
  script.onerror = (error) => {
    console.error('JavascriptSubtitlesOctopus 加载失败:', error)
  }
  document.head.appendChild(script)
})

onUnmounted(() => {
  stopInternalTimer()
  if (socket) {
    socket.disconnect()
  }
  if (subtitleRenderer) {
    subtitleRenderer.dispose()
  }
})
</script>

<style scoped>
.subtitle-view {
  width: 1920px;
  height: 1080px;
  background-color: transparent;
  position: relative;
  overflow: hidden;
}

.subtitle-container {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.subtitle-canvas {
  width: 1920px;
  height: 1080px;
  background-color: transparent;
}
</style> 