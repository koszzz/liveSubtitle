// 动态加载字体文件
export async function loadFonts(): Promise<string[]> {
    try {
        const response = await fetch('/api/fonts');
        if (!response.ok) {
            console.error('获取字体列表失败:', response.status);
            return [];
        }

        const fonts = await response.json();
        console.log('找到字体文件:', fonts);

        const fontPaths = fonts.map((font: string) => `/fonts/${font}`);
        return fontPaths;
    } catch (error) {
        console.error('加载字体失败:', error);
        return [];
    }
}
