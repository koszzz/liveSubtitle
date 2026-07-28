import { readAllSubtitleFiles } from '../../utils/subtitle';

export default defineEventHandler((event) => {
    const id = getRouterParam(event, 'id');
    if (!id) {
        throw createError({ statusCode: 400, statusMessage: '缺少字幕ID' });
    }

    const subtitleFiles = readAllSubtitleFiles();
    const subtitleFile = subtitleFiles.find((file) => file.id === id);

    if (!subtitleFile) {
        throw createError({ statusCode: 404, statusMessage: '字幕文件不存在' });
    }

    return subtitleFile;
});
