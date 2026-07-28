<template>
    <div class="subtitle-view">
        <div class="subtitle-container">
            <canvas ref="canvas" class="subtitle-canvas"></canvas>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { SubtitleFile } from '~/types/subtitle';
import { loadFonts } from '~/utils/fontLoader';

const canvas = ref<HTMLCanvasElement>();
const currentTime = ref(0);
const isPlaying = ref(false);
const selectedFile = ref<SubtitleFile | null>(null);

// auto-imported by @xarenas107/nuxt-socket-io
const socket: any = useSocketIO();

let subtitleRenderer: any = null;
let internalTimer: number | null = null;

const initSocketListeners = () => {
    socket.on('connect', () => {
        console.log('展示端已连接到服务器，Socket ID:', socket.id);
    });

    socket.on('play-state-change', (data: any) => {
        console.log('收到播放状态变化:', data);
        isPlaying.value = data.isPlaying;

        if (data.isPlaying) {
            startInternalTimer();
        } else {
            stopInternalTimer();
        }
    });

    socket.on('time-sync', (data: any) => {
        console.log('收到时间同步:', data);
        currentTime.value = data.currentTime;
        updateSubtitles();

        if (isPlaying.value) {
            startInternalTimer();
        }
    });

    socket.on('ass-content-update', (data: any) => {
        console.log('收到ASS文件更新:', data);
        if (data.assContent) {
            const wasPlaying = isPlaying.value;
            const currentTimeBeforeUpdate = currentTime.value;

            initSubtitleRenderers(data.assContent).then(() => {
                if (wasPlaying) {
                    currentTime.value = currentTimeBeforeUpdate;
                    updateSubtitles();
                    startInternalTimer();
                }
            });
        }
    });

    socket.on('file-selected', (data: any) => {
        console.log('收到文件选择:', data);
        selectedFile.value = data.file;
        loadSubtitleFile(data.file);
    });

    socket.on('disconnect', () => {
        console.log('与服务器断开连接');
        stopInternalTimer();
    });

    socket.on('connect_error', (error: any) => {
        console.error('Socket.io 连接错误:', error);
    });
};

const loadSubtitleFile = async (file: SubtitleFile) => {
    if (!file) return;

    try {
        console.log('加载字幕文件:', file.id);
        const response = await fetch(`/api/subtitle-file/${file.id}`);
        if (!response.ok) {
            console.error('获取字幕文件失败:', response.status);
            return;
        }

        const assContent = await response.text();

        await initSubtitleRenderers(assContent);

        currentTime.value = 0;
        updateSubtitles();
    } catch (error) {
        console.error('加载字幕文件失败:', error);
    }
};

const initSubtitleRenderers = async (assContent: string): Promise<void> => {
    if (!canvas.value) return;

    console.log('初始化字幕渲染器');

    if (subtitleRenderer) {
        subtitleRenderer.dispose();
    }

    return new Promise((resolve, reject) => {
        try {
            if (canvas.value) {
                canvas.value.width = 1920;
                canvas.value.height = 1080;
            }

            loadFonts()
                .then((fonts) => {
                    subtitleRenderer = new (window as any).SubtitlesOctopus({
                        canvas: canvas.value,
                        subContent: assContent,
                        fonts: fonts,
                        workerUrl: '/js/subtitles-octopus-worker.js',
                        legacyWorkerUrl: '/js/subtitles-octopus-worker-legacy.js',
                        debug: true,
                        onReady: () => {
                            console.log('字幕渲染器就绪');
                            resolve();
                        },
                        onError: (error: any) => {
                            console.error('字幕渲染器错误:', error);
                            reject(error);
                        },
                    });
                })
                .catch((error) => {
                    console.error('加载字体失败:', error);
                    reject(error);
                });
        } catch (error) {
            console.error('初始化字幕渲染器失败:', error);
            reject(error);
        }
    });
};

const startInternalTimer = () => {
    if (internalTimer) {
        stopInternalTimer();
    }

    console.log('启动内部计时器');
    const startTime = Date.now();
    const startCurrentTime = currentTime.value;

    internalTimer = window.setInterval(() => {
        if (isPlaying.value && selectedFile.value) {
            const elapsed = (Date.now() - startTime) / 1000;
            currentTime.value = startCurrentTime + elapsed;

            if (currentTime.value > selectedFile.value.duration) {
                currentTime.value = selectedFile.value.duration;
                stopInternalTimer();
            }
            updateSubtitles();
        }
    }, 16);
};

const stopInternalTimer = () => {
    if (internalTimer) {
        console.log('停止内部计时器');
        clearInterval(internalTimer);
        internalTimer = null;
    }
};

const updateSubtitles = () => {
    try {
        if (subtitleRenderer) {
            subtitleRenderer.setCurrentTime(currentTime.value);
        }
    } catch (error) {
        console.error('更新字幕失败:', error);
    }
};

onMounted(() => {
    console.log('展示端组件挂载');
    socket.connect();
    initSocketListeners();
    const script = document.createElement('script');
    script.src = '/js/subtitles-octopus.js';
    script.onload = () => {
        console.log('JavascriptSubtitlesOctopus 加载完成');
    };
    script.onerror = (error) => {
        console.error('JavascriptSubtitlesOctopus 加载失败:', error);
    };
    document.head.appendChild(script);
});

onUnmounted(() => {
    stopInternalTimer();
    socket.disconnect();
    if (subtitleRenderer) {
        subtitleRenderer.dispose();
    }
});
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
