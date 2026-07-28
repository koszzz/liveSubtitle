import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { SubtitleFile, PlaybackState, FilterOptions, FilterConfig } from "@/types/subtitle";
import { fetchSubtitleFiles, fetchFilterConfig } from "@/data/api";
import { io } from "socket.io-client";

export const useSubtitleStore = defineStore("subtitle", () => {
  // 状态
  const subtitleFiles = ref<SubtitleFile[]>([]);
  const isLoading = ref(false);
  const selectedFile = ref<SubtitleFile | null>(null);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const subtitleColorEnabled = ref(true); // 字幕颜色开关，默认开启
  const selectedColor = ref("Liella"); // 默认选择Liella颜色
  const filterOptions = ref<FilterOptions>({
    searchText: "",
  });
  const filterConfig = ref<FilterConfig>([]);

  // 预设颜色配置
  const colorPresets = {
    Liella: "#A5469C",
    涩谷香音: "#FF7F27",
    唐可可: "#43D1D9",
    岚千砂都: "#FF6E90",
    平安名堇: "#4B9C40",
    叶月恋: "#0000A0",
    樱小路希奈子: "#ABA229",
    米女芽衣: "#FF3535",
    若菜四季: "#7FB0A6",
    鬼冢夏美: "#FF51C4",
    薇恩·玛格丽特: "#D895F0",
    鬼冢冬毬: "#27A7AE",
    "Sunny Passion": "#FF683D",
    柊摩央: "#9A1B5A",
    圣泽悠奈: "#B4AA2B",
  };

  // Socket.io 连接
  let socket: any = null;

  // 计算属性
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
    // 返回所有可能的筛选器类型
    return ["unit", "album", "live", "solo"];
  });

  const currentBlocks = computed(() => {
    if (!selectedFile.value) return [];

    return selectedFile.value.blocks.filter(
      (block) => currentTime.value >= block.startTime && currentTime.value <= block.endTime
    );
  });

  // 方法
  const selectFile = (file: SubtitleFile) => {
    selectedFile.value = file;
    currentTime.value = 0;
    isPlaying.value = false;
    // 切换字幕文件时自动开启字幕颜色
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
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 修改ASS文件颜色
  const modifyAssColor = (assContent: string): string => {
    const lines = assContent.split("\n");

    console.log("开始修改ASS文件颜色...");

    // 获取选中的颜色并转换为ASS格式
    const selectedColorHex = colorPresets[selectedColor.value as keyof typeof colorPresets];
    if (!selectedColorHex) {
      console.error("未找到选中的颜色:", selectedColor.value);
      return assContent;
    }

    // 移除#号并两两分组
    const colorHex = selectedColorHex.replace("#", "");
    const group1 = colorHex.substring(0, 2);
    const group2 = colorHex.substring(2, 4);
    const group3 = colorHex.substring(4, 6);

    // 转换为ASS格式：&H00{第三组}{第二组}{第一组}
    const assColor = `&H00${group3}${group2}${group1}`;

    console.log(`颜色转换: ${selectedColorHex} -> ${assColor}`);
    console.log(`分组: ${group1},${group2},${group3} -> ${group3}${group2}${group1}`);

    let startIndex = -1;
    let endIndex = -1;

    // 查找[V4+ Styles]部分的Format行
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === "[V4+ Styles]") {
        console.log(`找到[V4+ Styles]在第${i + 1}行`);
        // 查找Format行
        for (let j = i + 1; j < lines.length; j++) {
          const formatLine = lines[j].trim();
          if (formatLine.startsWith("Format:")) {
            console.log(`找到Format行在第${j + 1}行: ${formatLine}`);
            startIndex = j + 1; // Format行的下一行开始处理
            break;
          }
        }
        break;
      }
    }

    if (startIndex === -1) {
      console.error("未找到[V4+ Styles]部分或Format行");
      return assContent;
    }

    // 从startIndex开始处理，直到遇到空行
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === "") {
        endIndex = i;
        console.log(`遇到空行在第${i + 1}行，处理结束`);
        break;
      }

      // 处理样式行
      const parts = line.split(",");
      if (parts.length >= 6) {
        // 将第六项（索引5）替换为转换后的颜色
        parts[5] = assColor;
        lines[i] = parts.join(",");
        console.log(`修改第${i + 1}行: ${lines[i]}`);
      } else {
        console.log(`第${i + 1}行格式不正确，跳过: ${line}`);
      }
    }

    if (endIndex === -1) {
      console.log("未找到空行，处理到文件末尾");
    }

    const modifiedContent = lines.join("\n");
    console.log("ASS文件修改完成");
    return modifiedContent;
  };

  // 切换字幕颜色
  const toggleSubtitleColor = async () => {
    console.log("开始切换字幕颜色，当前状态:", subtitleColorEnabled.value);
    subtitleColorEnabled.value = !subtitleColorEnabled.value;
    console.log("切换后状态:", subtitleColorEnabled.value);

    if (selectedFile.value) {
      try {
        // 获取原始ASS文件内容
        const response = await fetch(
          `http://localhost:3001/api/subtitle-file/${selectedFile.value.id}`
        );
        if (!response.ok) {
          console.error("获取字幕文件失败:", response.status);
          return;
        }

        const originalAssContent = await response.text();
        let modifiedAssContent = originalAssContent;

        // 如果关闭颜色，修改ASS文件
        if (!subtitleColorEnabled.value) {
          modifiedAssContent = modifyAssColor(originalAssContent);
        } else {
          console.log("开启颜色，使用原始ASS文件");
        }

        // 发送修改后的ASS文件到展示端
        if (socket) {
          console.log("准备发送ASS文件更新，内容长度:", modifiedAssContent.length);
          console.log("Socket连接状态:", socket.connected);

          // 发送ASS文件更新
          socket.emit("ass-content-update", {
            assContent: modifiedAssContent,
          });
          console.log("发送ASS文件更新:", subtitleColorEnabled.value ? "开启颜色" : "关闭颜色");
        } else {
          console.error("Socket连接不存在，无法发送ASS文件更新");
        }
      } catch (error) {
        console.error("切换字幕颜色失败:", error);
      }
    } else {
      console.error("没有选中的文件");
    }
  };

  // 初始化 Socket.io 连接
  const initSocket = () => {
    console.log("开始初始化Socket连接...");
    socket = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("控制端已连接到服务器，Socket ID:", socket.id);
      console.log("Socket连接状态:", socket.connected);
    });

    socket.on("disconnect", () => {
      console.log("控制端与服务器断开连接");
    });

    socket.on("connect_error", (error: any) => {
      console.error("控制端Socket连接错误:", error);
    });
  };

  // 广播播放状态变化
  const broadcastPlayStateChange = () => {
    if (socket) {
      const data = {
        isPlaying: isPlaying.value,
      };
      console.log("广播播放状态变化:", data);
      socket.emit("play-state-change", data);
    }
  };

  // 广播时间同步
  const broadcastTimeSync = () => {
    if (socket) {
      const data = {
        currentTime: currentTime.value,
      };
      console.log("广播时间同步:", data);
      socket.emit("time-sync", data);
    }
  };

  // 广播文件选择
  const broadcastFileSelect = (file: SubtitleFile) => {
    if (socket) {
      console.log("广播文件选择:", file);
      socket.emit("file-selected", { file });

      // 同时发送当前颜色状态的ASS文件
      setTimeout(async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/subtitle-file/${file.id}`);
          if (response.ok) {
            const originalAssContent = await response.text();
            let assContent = originalAssContent;

            if (!subtitleColorEnabled.value) {
              assContent = modifyAssColor(originalAssContent);
            }

            socket.emit("ass-content-update", { assContent: assContent });
            console.log("文件选择后发送ASS文件更新");
          }
        } catch (error) {
          console.error("文件选择后发送ASS文件失败:", error);
        }
      }, 100); // 延迟100ms确保展示端已准备好
    }
  };

  // 广播颜色变化
  const broadcastColorChange = async () => {
    if (socket && selectedFile.value && !subtitleColorEnabled.value) {
      try {
        const response = await fetch(
          `http://localhost:3001/api/subtitle-file/${selectedFile.value.id}`
        );
        if (response.ok) {
          const originalAssContent = await response.text();
          let assContent = originalAssContent;

          assContent = modifyAssColor(originalAssContent);

          socket.emit("ass-content-update", { assContent: assContent });
          console.log("颜色变化后发送ASS文件更新");
        }
      } catch (error) {
        console.error("颜色变化后发送ASS文件失败:", error);
      }
    }
  };

  // 加载字幕文件
  const loadSubtitleFiles = async () => {
    isLoading.value = true;
    try {
      const [files, config] = await Promise.all([fetchSubtitleFiles(), fetchFilterConfig()]);
      subtitleFiles.value = files;
      filterConfig.value = config;

      // 初始化 Socket.io 连接
      initSocket();
    } catch (error) {
      console.error("加载数据失败:", error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // 状态
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

    // 计算属性
    filteredFiles,
    filters,
    filterTypes,
    currentBlocks,

    // 方法
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
