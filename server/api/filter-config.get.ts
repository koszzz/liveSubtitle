import { readFilterConfig } from '../utils/subtitle';

export default defineEventHandler(() => {
    return readFilterConfig();
});
