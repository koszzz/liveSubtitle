<template>
    <div class="home-container">
        <main class="main-content">
            <div class="container">
                <div class="timeline-section">
                    <Timeline />
                </div>
                <div class="subtitle-selector-section">
                    <SubtitleSelector />
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
// auto-imported by @xarenas107/nuxt-socket-io
const socket: any = useSocketIOStore();

onMounted(() => {
    socket.connect();
});
</script>

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
