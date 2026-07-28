import fs from 'node:fs';
import path from 'node:path';

function timeToSeconds(timeStr: string): number {
    const parts = timeStr.split(':');
    return parseInt(parts[0]!) * 3600 + parseInt(parts[1]!) * 60 + parseFloat(parts[2]!);
}

function loadSubtitleFile(folderPath: string, songName: string) {
    const configPath = path.join(folderPath, 'config.txt');
    if (!fs.existsSync(configPath)) {
        throw new Error(`配置文件不存在: ${configPath}`);
    }

    const content = fs.readFileSync(configPath, 'utf-8');
    const lines = content.trim().split('\n');

    const blocks: Array<{
        id: string;
        startTime: number;
        endTime: number;
        text: string;
        track: number;
    }> = [];
    let maxEndTime = 0;

    lines.forEach((line, index) => {
        const parts = line.split(',');
        if (parts.length >= 4) {
            const track = parseInt(parts[0]!);
            const startTime = timeToSeconds(parts[1]!);
            const endTime = timeToSeconds(parts[2]!);
            const text = parts.slice(3).join(',');

            blocks.push({
                id: `${songName}-${index + 1}`,
                startTime,
                endTime,
                text,
                track,
            });

            maxEndTime = Math.max(maxEndTime, endTime);
        }
    });

    return {
        id: songName,
        name: songName,
        duration: maxEndTime,
        blocks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

export function readAllSubtitleFiles() {
    const subtitleFilesDir = path.join(process.cwd(), 'subtitleFiles');

    if (!fs.existsSync(subtitleFilesDir)) {
        console.warn('subtitleFiles 文件夹不存在');
        return [];
    }

    const songFolders = fs
        .readdirSync(subtitleFilesDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    const subtitleFiles: ReturnType<typeof loadSubtitleFile>[] = [];

    songFolders.forEach((songName) => {
        try {
            const folderPath = path.join(subtitleFilesDir, songName);
            const subtitleFile = loadSubtitleFile(folderPath, songName);
            subtitleFiles.push(subtitleFile);
        } catch (error) {
            console.error(`读取字幕文件失败 ${songName}:`, error);
        }
    });

    return subtitleFiles;
}

export function readFilterConfig() {
    const configPath = path.join(process.cwd(), 'subtitleFiles', 'filter-config.json');

    if (!fs.existsSync(configPath)) {
        console.warn('过滤器配置文件不存在，返回空配置');
        return [];
    }

    try {
        const content = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('读取过滤器配置失败:', error);
        return [];
    }
}

export function readAssFile(id: string): string | null {
    const filePath = path.join(process.cwd(), 'subtitleFiles', id, 'subtitle.ass');

    if (!fs.existsSync(filePath)) {
        return null;
    }

    return fs.readFileSync(filePath, 'utf-8');
}

export function getFontList(): string[] {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');

    if (!fs.existsSync(fontsDir)) {
        return [];
    }

    const files = fs.readdirSync(fontsDir);
    return files.filter((file) => {
        const ext = file.toLowerCase();
        return (
            ext.endsWith('.ttf') ||
            ext.endsWith('.otf') ||
            ext.endsWith('.ttc') ||
            ext.endsWith('.woff') ||
            ext.endsWith('.woff2')
        );
    });
}
