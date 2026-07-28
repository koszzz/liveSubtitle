<script setup lang="ts">
import { computed } from 'vue'
import { useSubtitleStore } from '@/stores/subtitle'
import SubtitleSelector from '@/components/SubtitleSelector.vue'
import Timeline from '@/components/Timeline.vue'

const store = useSubtitleStore()

// 从store获取状态
const selectedFile = computed(() => store.selectedFile)
const isPlaying = computed(() => store.isPlaying)
const subtitleFiles = computed(() => store.subtitleFiles)
const artists = computed(() => store.artists)
const albums = computed(() => store.albums)

// 计算属性
const totalBlocks = computed(() => {
  return subtitleFiles.value.reduce((total, file) => total + file.blocks.length, 0)
})

// 方法
const formatDuration = (seconds: number): string => {
  return store.formatTime(seconds)
}

const resetPlayback = () => {
  store.setCurrentTime(0)
  store.pause()
}

const togglePlayback = () => {
  if (isPlaying.value) {
    store.pause()
  } else {
    store.play()
  }
}
</script>

<template>
  <div class="home-container">
    <!-- 主要内容 -->
    <main class="main-content">
      <div class="container">
        <!-- 时间轴区域 -->
        <div class="timeline-section">
          <Timeline />
        </div>

        <!-- 字幕选择区域 -->
        <div class="subtitle-selector-section">
          <SubtitleSelector />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-container {
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

.main-content {
  height: 100vh;
  padding: 12px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.timeline-section {
  flex-shrink: 0;
  margin-bottom: 20px;
}

.subtitle-selector-section {
  flex: 1;
  min-height: 0;
}
</style>
