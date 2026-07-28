import { readAssFile } from '../../utils/subtitle';

export default defineEventHandler((event) => {
    const id = getRouterParam(event, 'id');
    if (!id) {
        throw createError({ statusCode: 400, statusMessage: '缺少字幕ID' });
    }

    const assContent = readAssFile(id);
    if (assContent === null) {
        throw createError({ statusCode: 404, statusMessage: 'ASS 字幕文件不存在' });
    }

    setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
    return assContent;
});
