import type { SubtitleFile, FilterConfig } from '@/types/subtitle'

// 从后端 API 获取字幕数据
export async function fetchSubtitleFiles(): Promise<SubtitleFile[]> {
  try {
    const response = await fetch('http://localhost:3001/api/subtitles')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取字幕文件失败:', error)
    // 如果后端不可用，返回空数组
    return []
  }
}

// 获取单个字幕文件
export async function fetchSubtitleFile(id: string): Promise<SubtitleFile | null> {
  try {
    const response = await fetch(`http://localhost:3001/api/subtitles/${id}`)
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取字幕文件失败:', error)
    return null
  }
}

// 获取过滤器配置
export async function fetchFilterConfig(): Promise<FilterConfig> {
  try {
    const response = await fetch('http://localhost:3001/api/filter-config')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取过滤器配置失败:', error)
    // 如果后端不可用，返回空配置
    return []
  }
}

// API 数据获取模块 