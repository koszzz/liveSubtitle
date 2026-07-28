// 字幕块类型
export interface SubtitleBlock {
    id: string;
    startTime: number;
    endTime: number;
    text: string;
    track: number;
}

// 字幕文件类型
export interface SubtitleFile {
    id: string;
    name: string;
    artist?: string;
    album?: string;
    duration: number;
    blocks: SubtitleBlock[];
    createdAt: string;
    updatedAt: string;
}

// 播放状态类型
export interface PlaybackState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    selectedFile: SubtitleFile | null;
}

// 筛选选项类型
export interface FilterOptions {
    searchText: string;
}

// 筛选器类型
export interface Filter {
    name: string;
    type: 'album' | 'unit' | 'live' | 'solo';
    songs: string[];
}

// 筛选配置类型
export type FilterConfig = Filter[];
