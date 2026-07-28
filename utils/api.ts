import type { SubtitleFile, FilterConfig } from '~/types/subtitle';

export async function fetchSubtitleFiles(): Promise<SubtitleFile[]> {
    try {
        const response = await fetch('/api/subtitles');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取字幕文件失败:', error);
        return [];
    }
}

export async function fetchSubtitleFile(id: string): Promise<SubtitleFile | null> {
    try {
        const response = await fetch(`/api/subtitles/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取字幕文件失败:', error);
        return null;
    }
}

export async function fetchFilterConfig(): Promise<FilterConfig> {
    try {
        const response = await fetch('/api/filter-config');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取过滤器配置失败:', error);
        return [];
    }
}
