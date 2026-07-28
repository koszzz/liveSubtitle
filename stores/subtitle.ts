import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SubtitleFile, FilterOptions, FilterConfig } from '~/types/subtitle';
import { fetchSubtitleFiles, fetchFilterConfig } from '~/utils/api';

export const useSubtitleStore = defineStore('subtitle', () => {
    // 状态
    const subtitleFiles = ref<SubtitleFile[]>([]);
    const isLoading = ref(false);
    const selectedFile = ref<SubtitleFile | null>(null);
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const subtitleColorEnabled = ref(true);
    const selectedColor = ref('Liella');
    const filterOptions = ref<FilterOptions>({
        searchText: '',
    });
    const filterConfig = ref<FilterConfig>([]);

    // 预设颜色配置
    const colorPresets = {
        Liella: '#A5469C',
        涩谷香音: '#FF7F27',
        唐可可: '#43D1D9',
        岚千砂都: '#FF6E90',
        平安名堇: '#4B9C40',
        叶月恋: '#0000A0',
        樱小路希奈子: '#ABA229',
        米女芽衣: '#FF3535',
        若菜四季: '#7FB0A6',
        鬼冢夏美: '#FF51C4',
        '薇恩·玛格丽特': '#D895F0',
        鬼冢冬毬: '#27A7AE',
        'Sunny Passion': '#FF683D',
        柊摩央: '#9A1B5A',
        圣泽悠奈: '#B4AA2B',
    };

    // socket.io - auto-imported by @xarenas107/nuxt-socket-io
    const socket: any = useSocketIOStore();

    const filteredFiles = computed(() => {
        return subtitleFiles.value.filter((file) => {
            const matchesSearch =
                !filterOptions.value.searchText ||
                file.name.toLowerCase().includes(filterOptions.value.searchText.toLowerCase());
            return matchesSearch;
        });
    });

    const filters = computed(() => {
        return filterConfig.value || [];
    });

    const filterTypes = computed(() => {
        return ['unit', 'album', 'live', 'solo'];
    });

    const currentBlocks = computed(() => {
        if (!selectedFile.value) return [];
        return selectedFile.value.blocks.filter(
            (block) => currentTime.value >= block.startTime && currentTime.value <= block.endTime,
        );
    });

    const selectFile = (file: SubtitleFile) => {
        selectedFile.value = file;
        currentTime.value = 0;
        isPlaying.value = false;
        subtitleColorEnabled.value = true;
        broadcastFileSelect(file);
    };

    const play = () => {
        if (selectedFile.value) {
            isPlaying.value = true;
            broadcastPlayStateChange();
        }
    };

    const pause = () => {
        isPlaying.value = false;
        broadcastPlayStateChange();
    };

    const setCurrentTime = (time: number) => {
        if (selectedFile.value) {
            currentTime.value = Math.max(0, Math.min(time, selectedFile.value.duration));
            broadcastTimeSync();
        }
    };

    const updateFilter = (newFilter: Partial<FilterOptions>) => {
        filterOptions.value = { ...filterOptions.value, ...newFilter };
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const modifyAssColor = (assContent: string): string => {
        const lines = assContent.split('\n');

        const selectedColorHex = colorPresets[selectedColor.value as keyof typeof colorPresets];
        if (!selectedColorHex) {
            console.error('未找到选中的颜色:', selectedColor.value);
            return assContent;
        }

        const colorHex = selectedColorHex.replace('#', '');
        const group1 = colorHex.substring(0, 2);
        const group2 = colorHex.substring(2, 4);
        const group3 = colorHex.substring(4, 6);

        const assColor = `&H00${group3}${group2}${group1}`;

        let startIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]!.trim();
            if (line === '[V4+ Styles]') {
                for (let j = i + 1; j < lines.length; j++) {
                    const formatLine = lines[j]!.trim();
                    if (formatLine.startsWith('Format:')) {
                        startIndex = j + 1;
                        break;
                    }
                }
                break;
            }
        }

        if (startIndex === -1) {
            console.error('未找到[V4+ Styles]部分或Format行');
            return assContent;
        }

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i]!.trim();
            if (line === '') {
                break;
            }

            const parts = line.split(',');
            if (parts.length >= 6) {
                parts[5] = assColor;
                lines[i] = parts.join(',');
            }
        }

        return lines.join('\n');
    };

    const toggleSubtitleColor = async () => {
        subtitleColorEnabled.value = !subtitleColorEnabled.value;

        if (selectedFile.value) {
            try {
                const response = await fetch(`/api/subtitle-file/${selectedFile.value.id}`);
                if (!response.ok) {
                    console.error('获取字幕文件失败:', response.status);
                    return;
                }

                const originalAssContent = await response.text();
                let modifiedAssContent = originalAssContent;

                if (!subtitleColorEnabled.value) {
                    modifiedAssContent = modifyAssColor(originalAssContent);
                }

                socket.emit('ass-content-update', {
                    assContent: modifiedAssContent,
                });
            } catch (error) {
                console.error('切换字幕颜色失败:', error);
            }
        }
    };

    const broadcastPlayStateChange = () => {
        socket.emit('play-state-change', { isPlaying: isPlaying.value });
    };

    const broadcastTimeSync = () => {
        socket.emit('time-sync', { currentTime: currentTime.value });
    };

    const broadcastFileSelect = (file: SubtitleFile) => {
        socket.emit('file-selected', { file });

        setTimeout(async () => {
            try {
                const response = await fetch(`/api/subtitle-file/${file.id}`);
                if (response.ok) {
                    const originalAssContent = await response.text();
                    let assContent = originalAssContent;

                    if (!subtitleColorEnabled.value) {
                        assContent = modifyAssColor(originalAssContent);
                    }

                    socket.emit('ass-content-update', { assContent });
                }
            } catch (error) {
                console.error('文件选择后发送ASS文件失败:', error);
            }
        }, 100);
    };

    const broadcastColorChange = async () => {
        if (selectedFile.value && !subtitleColorEnabled.value) {
            try {
                const response = await fetch(`/api/subtitle-file/${selectedFile.value.id}`);
                if (response.ok) {
                    const originalAssContent = await response.text();
                    const assContent = modifyAssColor(originalAssContent);
                    socket.emit('ass-content-update', { assContent });
                }
            } catch (error) {
                console.error('颜色变化后发送ASS文件失败:', error);
            }
        }
    };

    const loadSubtitleFiles = async () => {
        isLoading.value = true;
        try {
            const [files, config] = await Promise.all([fetchSubtitleFiles(), fetchFilterConfig()]);
            subtitleFiles.value = files;
            filterConfig.value = config;
        } catch (error) {
            console.error('加载数据失败:', error);
        } finally {
            isLoading.value = false;
        }
    };

    return {
        subtitleFiles,
        selectedFile,
        isPlaying,
        currentTime,
        subtitleColorEnabled,
        selectedColor,
        colorPresets,
        filterOptions,
        filterConfig,
        isLoading,
        filteredFiles,
        filters,
        filterTypes,
        currentBlocks,
        selectFile,
        play,
        pause,
        setCurrentTime,
        updateFilter,
        formatTime,
        toggleSubtitleColor,
        modifyAssColor,
        loadSubtitleFiles,
        broadcastPlayStateChange,
        broadcastTimeSync,
        broadcastColorChange,
    };
});
