<script>
import { UploadFilled } from '@element-plus/icons-vue'
export default {
    data() {
        return {
            lyrics: [],
            ja: '日本語',
            zh: '中文',
            choosedSong: 0,
            lyricIndex: 0,
            hind: false,
            isUploaded: false,
        };
    },
    created() {
        // fetch('data.json').then(res => res.json()).then(data => {
        //     this.lyrics = data
        // })
    },
    components: {
        UploadFilled
    },
    methods: {
        chooseSong(e) {
            this.choosedSong = e.index;
            this.lyricIndex = 0
        },
        chooseLyric(e) {
            this.lyricIndex = e.index
        },
        keyDown() {
            document.onkeydown = (e) => {
                let e1 = e || event || window.event || arguments.callee.caller.arguments[0];
                if (e1 && e1.keyCode == 40) {
                    // 按下方向下键
                    if (this.lyricIndex < this.lyrics[this.choosedSong].lyrics.length - 1) {
                        this.lyricIndex = this.lyricIndex + 1
                        this.hind = false
                    }
                } else if (e1 && e1.keyCode == 37) {
                    // 按下方向左键
                    this.hind = !this.hind
                }
            }
        },
        handleUpload(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.isUploaded=true
                this.lyrics = JSON.parse(e.target.result);
            };
            reader.readAsText(file.raw);
        }
    },
    mounted() {
        this.keyDown();
    }
}
</script>

<template>
    <div class="upload" v-if="!isUploaded">
        <el-upload class="upload" drag action="" multiple :auto-upload="false" :on-change="handleUpload" accept=".json">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
                将歌词JSON文件拖拽到此或<em>点击上传</em>
            </div>
        </el-upload>
    </div>
    <div class="container" v-if="isUploaded">
        <div class="subtitle">
            <span class="ja" :style="`opacity: ${hind ? 0 : 1};`">{{ lyrics[choosedSong].lyrics[lyricIndex].ja }}</span>
            <span class="zh" :style="`opacity: ${hind ? 0 : 1};`">{{ lyrics[choosedSong].lyrics[lyricIndex].zh }}</span>
        </div>
        <div class="tables">
            <el-table :data="lyrics[choosedSong].lyrics.filter((i, index) => index >= lyricIndex)"
                style="width: 800px;height: 600px" border @row-click="chooseLyric">
                <el-table-column prop="ja" label="歌词" />
            </el-table>
            <el-table :data="lyrics" style="width: 800px;height: 600px" border @row-click="chooseSong">
                <el-table-column prop="name" label="曲名" />
            </el-table>
        </div>
    </div>
</template>

<style>
.subtitle {
    width: 100vw;
    padding: 0;
    margin: 0;
    height: 200px;
    background-color: #A5469B;
    text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.75);
    color: white;
    font-size: 50px;
    text-align: center;
    font-weight: 700;
}

.ja {
    font-family: 'Noto Sans JP_', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    transition: all 0.2s ease-in-out;
    transform: translateY(29px);
}

.zh {
    font-family: 'Noto Sans SC_', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    transition: all 0.2s ease-in-out;
}

.container {
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
}

.tables {
    display: flex;
    gap: 100px
}

#app {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}

body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}

.common-layout,
.el-container {
    width: 100%;
    height: 100%;
}

td.el-table__cell {
    cursor: pointer;
}
</style>
