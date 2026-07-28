import { readAllSubtitleFiles } from '../utils/subtitle';

export default defineEventHandler(() => {
    return readAllSubtitleFiles();
});
