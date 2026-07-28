// 字幕块类型
export interface SubtitleBlock {
  id: string
  startTime: number // 开始时间（秒）
  endTime: number // 结束时间（秒）
  text: string // 字幕文本
  track: number // 轨道编号（1或2）
}

// 字幕文件类型
export interface SubtitleFile {
  id: string
  name: string
  artist: string // 演出者
  album: string // 专辑
  duration: number // 总时长（秒）
  blocks: SubtitleBlock[]
  createdAt: string
  updatedAt: string
}

// 播放状态类型
export interface PlaybackState {
  isPlaying: boolean
  currentTime: number // 当前播放时间（秒）
  duration: number // 总时长（秒）
  selectedFile: SubtitleFile | null
}

// 筛选选项类型
export interface FilterOptions {
  searchText: string
}

// 筛选器类型
export interface Filter {
  name: string // 筛选器名称
  type: 'album' | 'unit' | 'live' // 筛选器类型
  songs: string[] // 歌曲列表
}

// 筛选配置类型
export interface FilterConfig extends Array<Filter> {} 