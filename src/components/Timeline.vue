<template>
  <div class="timeline-container">
    <!-- 可滚动的时间轴内容 -->
    <div class="timeline-scroll-container">
      <!-- 时间刻度 -->
      <div 
        class="timeline-ruler"
        :style="{ width: `${(selectedFile?.duration || 100) / maxDuration * 100}%` }"
      >
        <div 
          v-for="tick in timeTicks" 
          :key="tick"
          class="time-tick"
          :style="{ left: `${(tick / (selectedFile?.duration || 100)) * 100}%` }"
        >
          <div class="tick-line"></div>
          <span class="tick-label">{{ formatTime(tick) }}</span>
        </div>
      </div>

            <!-- 轨道容器 -->
      <div 
        class="tracks-container"
        :style="{ width: `${(selectedFile?.duration || 100) / maxDuration * 100}%` }"
      >
        <!-- 轨道1 -->
        <div class="track track-1">
          <div class="track-content">
            <div 
              v-for="block in track1Blocks" 
              :key="block.id"
              class="subtitle-block block-track1"
              :class="{ 'block-active': isBlockActive(block) }"
              :style="{
                left: `${(block.startTime / (selectedFile?.duration || 100)) * 100}%`,
                width: `${((block.endTime - block.startTime) / (selectedFile?.duration || 100)) * 100}%`
              }"
              @click="seekToTime(block.startTime)"
            >
              <span class="block-text">{{ block.text }}</span>
            </div>
          </div>
        </div>

              <!-- 轨道2 -->
        <div class="track track-2">
          <div class="track-content">
            <div 
              v-for="block in track2Blocks" 
              :key="block.id"
              class="subtitle-block block-track2"
              :class="{ 'block-active': isBlockActive(block) }"
              :style="{
                left: `${(block.startTime / (selectedFile?.duration || 100)) * 100}%`,
                width: `${((block.endTime - block.startTime) / (selectedFile?.duration || 100)) * 100}%`
              }"
              @click="seekToTime(block.startTime)"
            >
              <span class="block-text">{{ block.text }}</span>
            </div>
          </div>
        </div>

      <!-- 播放头 -->
      <div 
        v-if="selectedFile"
        class="playhead"
        :style="{ left: `${(currentTime / (selectedFile?.duration || 100)) * 100}%` }"
      >
        <div class="playhead-handle"></div>
      </div>
    </div>
    </div>

    <!-- 时间微调控制 -->
    <div class="time-controls">
      <div class="current-time-display">
        <span class="time-label">当前时间:</span>
        <span class="time-value">{{ formatTimeWithMs(currentTime) }}</span>
      </div>
      <div class="time-adjustment">
        <button @click="adjustTime(-0.1)" class="time-btn" title="后退100ms">-100ms</button>
        <button @click="adjustTime(-0.05)" class="time-btn" title="后退50ms">-50ms</button>
        <button @click="adjustTime(0.05)" class="time-btn" title="前进50ms">+50ms</button>
        <button @click="adjustTime(0.1)" class="time-btn" title="前进100ms">+100ms</button>
      </div>
    </div>

    <!-- 缩放控制 -->
    <div class="zoom-controls">
      <button @click="zoomOut" class="zoom-btn">-</button>
      <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
      <button @click="zoomIn" class="zoom-btn">+</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch, ref, nextTick } from 'vue'
import { useSubtitleStore } from '@/stores/subtitle'
import type { SubtitleBlock } from '@/types/subtitle'

const store = useSubtitleStore()

// 缩放状态 - 默认100%，但效果等同于之前的600%
const zoomLevel = ref(1)

// 从store获取状态
const selectedFile = computed(() => store.selectedFile)
const currentTime = computed(() => store.currentTime)
const isPlaying = computed(() => store.isPlaying)

// 计算属性
const maxDuration = computed(() => {
  if (!selectedFile.value) return 100
  // 重新定义100%缩放的效果：1 = 原来的600%，所以除以6来调整基准
  return selectedFile.value.duration / (zoomLevel.value * 6)
})

const timeTicks = computed(() => {
  if (!selectedFile.value) return []
  
  const ticks = []
  const totalDuration = selectedFile.value.duration
  // 根据缩放级别调整刻度间隔
  const interval = Math.max(1, Math.ceil(totalDuration / (zoomLevel.value * 20)))
  
  for (let i = 0; i <= totalDuration; i += interval) {
    ticks.push(i)
  }
  return ticks
})

const track1Blocks = computed(() => 
  selectedFile.value?.blocks.filter(block => block.track === 1) || []
)

const track2Blocks = computed(() => 
  selectedFile.value?.blocks.filter(block => block.track === 2) || []
)

const currentBlocks = computed(() => store.currentBlocks)

// 方法
const formatTime = (seconds: number): string => {
  return store.formatTime(seconds)
}

// 格式化时间，精确到毫秒2位
const formatTimeWithMs = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }
}

const isBlockActive = (block: SubtitleBlock): boolean => {
  return currentTime.value >= block.startTime && currentTime.value <= block.endTime
}

const seekToTime = (time: number) => {
  store.setCurrentTime(time)
  store.play()
  
  // 重置计时器的起始时间，确保从新位置开始计时
  if (playInterval) {
    playStartTime = Date.now()
    playStartCurrentTime = time
  }
}

const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.5, 3.33) // 最大约等于原来的2000%
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.5, 0.083) // 最小约等于原来的50%
}

// 时间微调方法
const adjustTime = (adjustment: number) => {
  if (!selectedFile.value) return
  
  const newTime = Math.max(0, Math.min(selectedFile.value.duration, currentTime.value + adjustment))
  store.setCurrentTime(newTime)
  
  // 如果正在播放，重置计时器的起始时间
  if (isPlaying.value && playInterval) {
    playStartTime = Date.now()
    playStartCurrentTime = newTime
  }
}

// 自动播放逻辑
let playInterval: number | null = null
let playStartTime: number | null = null
let playStartCurrentTime: number | null = null

const startAutoPlay = () => {
  if (playInterval) return
  
  playStartTime = Date.now()
  playStartCurrentTime = currentTime.value
  
  playInterval = window.setInterval(() => {
    if (isPlaying.value && selectedFile.value) {
      // 基于实际时间计算，确保精确性
      const elapsed = (Date.now() - playStartTime!) / 1000
      const newTime = playStartCurrentTime! + elapsed
      
      if (newTime >= selectedFile.value.duration) {
        store.pause()
        store.setCurrentTime(0)
      } else {
        store.setCurrentTime(newTime)
      }
    }
  }, 16)
}

const stopAutoPlay = () => {
  if (playInterval) {
    clearInterval(playInterval)
    playInterval = null
  }
  playStartTime = null
  playStartCurrentTime = null
}

// 监听播放状态变化
const startWatching = () => {
  if (isPlaying.value) {
    startAutoPlay()
  } else {
    stopAutoPlay()
  }
}

// 监听选中文件变化，重置时间轴位置
watch(selectedFile, (newFile) => {
  if (newFile) {
    store.setCurrentTime(0)
    store.pause()
    // 重置缩放为100%
    zoomLevel.value = 1
    // 自动滚动到最左边
    nextTick(() => {
      const scrollContainer = document.querySelector('.timeline-scroll-container')
      if (scrollContainer) {
        scrollContainer.scrollLeft = 0
      }
    })
  }
})

// 键盘控制功能
const handleKeyDown = (event: KeyboardEvent) => {
  if (!selectedFile.value) return
  
  // 检查搜索框是否获得焦点，如果是则跳过键盘控制
  const searchInput = document.querySelector('.search-input') as HTMLInputElement
  if (searchInput && document.activeElement === searchInput) {
    return
  }
  
  const currentTime = store.currentTime
  console.log('键盘事件:', event.key, '当前时间:', currentTime)
  
  // 阻止所有方向键的默认滚动行为
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || 
      event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
  }
  
  // 轨道1控制：方向键
  if (event.key === 'ArrowLeft') {
    const track1Blocks = selectedFile.value.blocks.filter(block => block.track === 1)
    const currentBlock = track1Blocks.find(block => 
      currentTime >= block.startTime && currentTime <= block.endTime
    )
    console.log('左方向键 - 当前字幕块:', currentBlock)
    
    if (currentBlock) {
      // 如果当前在字幕块内，回退到当前字幕开始时间并停止播放
      store.setCurrentTime(currentBlock.startTime)
      store.pause()
    } else {
      // 如果当前不在任何字幕块内，向左查找第一个字幕的结束时间
      let targetBlock = null
      for (let i = track1Blocks.length - 1; i >= 0; i--) {
        if (track1Blocks[i].endTime <= currentTime) {
          targetBlock = track1Blocks[i]
          break
        }
      }
      
      if (targetBlock) {
        console.log('左方向键 - 回到上一个字幕结束时间:', targetBlock)
        store.setCurrentTime(targetBlock.endTime)
        store.pause()
      } else if (track1Blocks.length > 0) {
        // 如果没有找到，回到第一个字幕的开始时间
        console.log('左方向键 - 回到第一个字幕开始时间')
        store.setCurrentTime(track1Blocks[0].startTime)
        store.pause()
      }
    }
  } else if (event.key === 'ArrowDown') {
    // 播放下一条字幕，开始自动播放
    const track1Blocks = selectedFile.value.blocks.filter(block => block.track === 1)
    console.log('下方向键 - 轨道1字幕块:', track1Blocks)
    
    // 找到当前时间对应的字幕块索引
    let currentBlockIndex = -1
    for (let i = 0; i < track1Blocks.length; i++) {
      const block = track1Blocks[i]
      if (currentTime >= block.startTime && currentTime <= block.endTime) {
        currentBlockIndex = i
        break
      }
    }
    console.log('下方向键 - 当前字幕块索引:', currentBlockIndex)
    
    // 如果当前时间不在任何字幕块内，播放下一个字幕
    if (currentBlockIndex === -1) {
      // 找到下一个要播放的字幕块
      let nextBlockIndex = -1
      for (let i = 0; i < track1Blocks.length; i++) {
        if (currentTime < track1Blocks[i].startTime) {
          nextBlockIndex = i
          break
        }
      }
      
      if (nextBlockIndex !== -1) {
        // 播放下一个字幕块
        const nextBlock = track1Blocks[nextBlockIndex]
        console.log('下方向键 - 播放下一个字幕块:', nextBlock)
        store.setCurrentTime(nextBlock.startTime)
        store.play()
        // 重置计时器起始时间
        if (playInterval) {
          playStartTime = Date.now()
          playStartCurrentTime = nextBlock.startTime
        }
      } else if (track1Blocks.length > 0) {
        // 如果当前时间在所有字幕块之后，播放第一条字幕
        console.log('下方向键 - 播放第一条字幕')
        store.setCurrentTime(track1Blocks[0].startTime)
        store.play()
        // 重置计时器起始时间
        if (playInterval) {
          playStartTime = Date.now()
          playStartCurrentTime = track1Blocks[0].startTime
        }
      }
    } else {
      // 检查当前时间是否正好在字幕块的开始时间（即刚按过左键）
      const currentBlock = track1Blocks[currentBlockIndex]
      if (currentTime === currentBlock.startTime) {
        // 如果正好在开始时间，播放当前字幕块
        console.log('下方向键 - 播放当前字幕块（从开始）:', currentBlock)
        store.play()
        // 重置计时器起始时间
        if (playInterval) {
          playStartTime = Date.now()
          playStartCurrentTime = currentTime
        }
      } else {
        // 如果正在播放中，播放下一个字幕块
        if (currentBlockIndex < track1Blocks.length - 1) {
          const nextBlock = track1Blocks[currentBlockIndex + 1]
          console.log('下方向键 - 播放下一个字幕块:', nextBlock)
          store.setCurrentTime(nextBlock.startTime)
          store.play()
          // 重置计时器起始时间
          if (playInterval) {
            playStartTime = Date.now()
            playStartCurrentTime = nextBlock.startTime
          }
        }
      }
    }
  }
  
  // 轨道2控制：A键和S键
  else if (event.key === 'a' || event.key === 'A') {
    // 隐藏当前字幕，回退到当前字幕开始时间并停止播放
    const track2Blocks = selectedFile.value.blocks.filter(block => block.track === 2)
    const currentBlock = track2Blocks.find(block => 
      currentTime >= block.startTime && currentTime <= block.endTime
    )
    if (currentBlock) {
      store.setCurrentTime(currentBlock.startTime)
      store.pause()
    }
  } else if (event.key === 's' || event.key === 'S') {
    // 播放下一条字幕，开始自动播放
    const track2Blocks = selectedFile.value.blocks.filter(block => block.track === 2)
    
    // 找到当前时间对应的字幕块索引
    let currentBlockIndex = -1
    for (let i = 0; i < track2Blocks.length; i++) {
      const block = track2Blocks[i]
      if (currentTime >= block.startTime && currentTime <= block.endTime) {
        currentBlockIndex = i
        break
      }
    }
    
    // 如果当前时间不在任何字幕块内，播放下一个字幕
    if (currentBlockIndex === -1) {
      // 找到下一个要播放的字幕块
      let nextBlockIndex = -1
      for (let i = 0; i < track2Blocks.length; i++) {
        if (currentTime < track2Blocks[i].startTime) {
          nextBlockIndex = i
          break
        }
      }
      
      if (nextBlockIndex !== -1) {
        // 播放下一个字幕块
        const nextBlock = track2Blocks[nextBlockIndex]
        store.setCurrentTime(nextBlock.startTime)
        store.play()
        // 重置计时器起始时间
        if (playInterval) {
          playStartTime = Date.now()
          playStartCurrentTime = nextBlock.startTime
        }
      } else if (track2Blocks.length > 0) {
        // 如果当前时间在所有字幕块之后，播放第一条字幕
        store.setCurrentTime(track2Blocks[0].startTime)
        store.play()
        // 重置计时器起始时间
        if (playInterval) {
          playStartTime = Date.now()
          playStartCurrentTime = track2Blocks[0].startTime
        }
      }
    } else {
      // 检查当前时间是否正好在字幕块的开始时间（即刚按过左键）
      const currentBlock = track2Blocks[currentBlockIndex]
      if (currentTime === currentBlock.startTime) {
        // 如果正好在开始时间，播放当前字幕块
        store.play()
        // 重置计时器起始时间
        if (playInterval) {
          playStartTime = Date.now()
          playStartCurrentTime = currentTime
        }
      } else {
        // 如果正在播放中，播放下一个字幕块
        if (currentBlockIndex < track2Blocks.length - 1) {
          const nextBlock = track2Blocks[currentBlockIndex + 1]
          store.setCurrentTime(nextBlock.startTime)
          store.play()
          // 重置计时器起始时间
          if (playInterval) {
            playStartTime = Date.now()
            playStartCurrentTime = nextBlock.startTime
          }
        }
      }
    }
  }
}

// 添加和移除键盘事件监听
onMounted(() => {
  startWatching()
  document.addEventListener('keydown', handleKeyDown)
  
  // 监听用户滚动事件
  const scrollContainer = document.querySelector('.timeline-scroll-container')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
      isUserScrolling = true
      // 用户停止滚动后1秒恢复自动滚动
      setTimeout(() => {
        isUserScrolling = false
      }, 1000)
    })
  }
})

onUnmounted(() => {
  stopAutoPlay()
  document.removeEventListener('keydown', handleKeyDown)
})

// 监听播放状态
watch(isPlaying, startWatching)

// 自动滚动相关变量
let lastAutoScrollTime = 0
let isUserScrolling = false

// 监听播放头位置变化，自动滚动时间轴
watch(currentTime, (newTime) => {
  if (selectedFile.value && isPlaying.value && !isUserScrolling) {
    const now = Date.now()
    // 限制自动滚动频率，避免过于频繁
    if (now - lastAutoScrollTime > 500) { // 500ms间隔
      nextTick(() => {
        const scrollContainer = document.querySelector('.timeline-scroll-container')
        const playhead = document.querySelector('.playhead')
        if (scrollContainer && playhead && selectedFile.value) {
          const playheadLeft = (newTime / selectedFile.value.duration) * 100
          const containerWidth = scrollContainer.clientWidth
          const scrollWidth = scrollContainer.scrollWidth
          const playheadPosition = (playheadLeft / 100) * scrollWidth
          
          // 只有当播放头明显超出可视区域时才自动滚动
          const margin = containerWidth * 0.1 // 10%的边距
          if (playheadPosition < scrollContainer.scrollLeft + margin || 
              playheadPosition > scrollContainer.scrollLeft + containerWidth - margin) {
            scrollContainer.scrollLeft = playheadPosition - containerWidth / 2
            lastAutoScrollTime = now
          }
        }
      })
    }
  }
})
</script>

<style scoped>
.timeline-container {
  background-color: #1f2937;
  color: white;
  padding: 4px;
  border-radius: 8px;
  height: 132px; /* 增加12px高度为滚动条预留空间 */
  display: flex;
  flex-direction: column;
}

.timeline-scroll-container {
  flex: 1;
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #6b7280 #374151;
  scroll-behavior: smooth;
  /* 为滚动条预留空间 */
  padding-bottom: 12px;
}

.timeline-scroll-container::-webkit-scrollbar {
  height: 8px;
}

.timeline-scroll-container::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 4px;
}

.timeline-scroll-container::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

.timeline-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.timeline-ruler {
  position: relative;
  height: 20px;
  margin-bottom: 2px;
  background-color: #374151;
  border-radius: 2px;
  flex-shrink: 0;
  width: 100%;
}

.time-tick {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tick-line {
  width: 1px;
  height: 8px;
  background-color: #6b7280;
}

.tick-label {
  font-size: 8px;
  color: #9ca3af;
  margin-top: 1px;
}

.tracks-container {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
}

.track {
  height: 20px;
  background-color: #374151;
  border-radius: 2px;
  margin-bottom: 2px;
  position: relative;
  display: flex;
}

.track-content {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: visible;
  min-width: 100%;
}

.subtitle-block {
  position: absolute;
  height: 16px;
  top: 2px;
  border-radius: 2px;
  padding: 0 2px;
  display: flex;
  align-items: center;
  font-size: 9px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f59e0b;
  color: #000;
}

.block-track1 {
  background-color: #f59e0b;
}

.block-track1:hover {
  background-color: #d97706;
}

.block-track2 {
  background-color: #8b5cf6;
}

.block-track2:hover {
  background-color: #7c3aed;
}

.block-active {
  background-color: #10b981 !important;
  color: white;
}

.block-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.playhead {
  position: absolute;
  top: 0;
  height: 100%;
  width: 1px;
  background-color: #ef4444;
  z-index: 10;
  pointer-events: none;
  transition: left 0.1s linear;
}

.playhead-handle {
  position: absolute;
  top: 0;
  left: 50%;
  width: 4px;
  height: 4px;
  background-color: #ef4444;
  border-radius: 50%;
  transform: translateX(-50%);
}

.zoom-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 2px;
  flex-shrink: 0;
}

.zoom-btn {
  width: 16px;
  height: 16px;
  background-color: #4b5563;
  border: none;
  border-radius: 2px;
  color: white;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-btn:hover {
  background-color: #6b7280;
}

.zoom-level {
  font-size: 8px;
  color: #9ca3af;
  min-width: 24px;
  text-align: center;
}

/* 时间微调控制样式 */
.time-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  padding: 4px;
  background-color: #374151;
  border-radius: 4px;
  flex-shrink: 0;
}

.current-time-display {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-label {
  font-size: 10px;
  color: #9ca3af;
}

.time-value {
  font-size: 12px;
  font-weight: 600;
  color: #fbbf24;
  font-family: 'Courier New', monospace;
}

.time-adjustment {
  display: flex;
  gap: 2px;
}

.time-btn {
  padding: 2px 6px;
  background-color: #4b5563;
  border: none;
  border-radius: 3px;
  color: white;
  font-size: 9px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.time-btn:hover {
  background-color: #6b7280;
}

.time-btn:active {
  background-color: #374151;
}
</style> 