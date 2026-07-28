import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
    readAllSubtitleFiles,
    getFontList,
    readFilterConfig,
    readAssFile,
} from '../../server/utils/subtitle';

describe('readAllSubtitleFiles', () => {
    const files = readAllSubtitleFiles();

    it('returns a non-empty array', () => {
        expect(Array.isArray(files)).toBe(true);
        expect(files.length).toBeGreaterThan(0);
    });

    it('each file has required fields', () => {
        for (const file of files) {
            expect(file).toHaveProperty('id');
            expect(typeof file.id).toBe('string');
            expect(file.id.length).toBeGreaterThan(0);

            expect(file).toHaveProperty('name');
            expect(typeof file.name).toBe('string');

            expect(file).toHaveProperty('duration');
            expect(typeof file.duration).toBe('number');
            expect(file.duration).toBeGreaterThan(0);

            expect(file).toHaveProperty('blocks');
            expect(Array.isArray(file.blocks)).toBe(true);
            expect(file.blocks.length).toBeGreaterThan(0);

            expect(file).toHaveProperty('createdAt');
            expect(file).toHaveProperty('updatedAt');
        }
    });

    it('each block has valid structure', () => {
        for (const file of files) {
            for (const block of file.blocks) {
                expect(block).toHaveProperty('id');
                expect(typeof block.id).toBe('string');
                expect(block.id).toContain(file.name);

                expect(block).toHaveProperty('startTime');
                expect(typeof block.startTime).toBe('number');
                expect(block.startTime).toBeGreaterThanOrEqual(0);

                expect(block).toHaveProperty('endTime');
                expect(typeof block.endTime).toBe('number');
                expect(block.endTime).toBeGreaterThan(0);

                expect(block).toHaveProperty('text');
                expect(typeof block.text).toBe('string');

                expect(block).toHaveProperty('track');
                expect(typeof block.track).toBe('number');
                expect([1, 2]).toContain(block.track);
            }
        }
    });

    it('block times are ordered (startTime < endTime)', () => {
        for (const file of files) {
            for (const block of file.blocks) {
                expect(block.startTime).toBeLessThan(block.endTime);
            }
        }
    });

    it('duration matches max block endTime', () => {
        for (const file of files) {
            const maxEndTime = Math.max(...file.blocks.map((b) => b.endTime));
            expect(file.duration).toBe(maxEndTime);
        }
    });
});

describe('readAssFile', () => {
    it('returns a string for existing file', () => {
        const content = readAssFile('1.2.3！');
        expect(typeof content).toBe('string');
        expect(content).toContain('[Script Info]');
        expect(content).toContain('ScriptType: v4.00+');
        expect(content).toContain('[Events]');
    });

    it('returns null for non-existing file', () => {
        const content = readAssFile('non-existing-song');
        expect(content).toBeNull();
    });

    it('all subtitle files have readable ASS content', () => {
        const files = readAllSubtitleFiles();
        for (const file of files) {
            const ass = readAssFile(file.id);
            expect(ass, `ASS file for "${file.id}" should exist`).toBeTruthy();
            expect(ass).toContain('[Events]');
            // verify ASS format header
            expect(ass).toContain('[Script Info]');
            expect(ass).toContain('[V4+ Styles]');
        }
    });
});

describe('readFilterConfig', () => {
    const config = readFilterConfig();

    it('returns a non-empty array', () => {
        expect(Array.isArray(config)).toBe(true);
        expect(config.length).toBeGreaterThan(0);
    });

    it('each filter has valid structure', () => {
        for (const filter of config) {
            expect(filter).toHaveProperty('name');
            expect(typeof filter.name).toBe('string');

            expect(filter).toHaveProperty('type');
            expect(['album', 'unit', 'live', 'solo']).toContain(filter.type);

            expect(filter).toHaveProperty('songs');
            expect(Array.isArray(filter.songs)).toBe(true);
            expect(filter.songs.length).toBeGreaterThan(0);

            for (const song of filter.songs) {
                expect(typeof song).toBe('string');
            }
        }
    });

    it('filter-config.json exists on disk', () => {
        const configPath = path.join(process.cwd(), 'subtitleFiles', 'filter-config.json');
        expect(fs.existsSync(configPath)).toBe(true);
    });
});

describe('getFontList', () => {
    const fonts = getFontList();

    it('returns a non-empty array', () => {
        expect(Array.isArray(fonts)).toBe(true);
        expect(fonts.length).toBeGreaterThan(0);
    });

    it('all entries are font file extensions', () => {
        for (const font of fonts) {
            const ext = font.toLowerCase();
            const isFont =
                ext.endsWith('.ttf') ||
                ext.endsWith('.otf') ||
                ext.endsWith('.ttc') ||
                ext.endsWith('.woff') ||
                ext.endsWith('.woff2');
            expect(isFont, `"${font}" should be a font file`).toBe(true);
        }
    });

    it('fonts directory exists', () => {
        const fontsDir = path.join(process.cwd(), 'public', 'fonts');
        expect(fs.existsSync(fontsDir)).toBe(true);
    });

    it('contains known fonts', () => {
        const fontNames = fonts.join(',');
        expect(fontNames).toContain('FZFWZhuZiAYuanJWB.TTF');
        expect(fontNames).toContain('TsukushiAMaruGothic.ttc');
    });
});

describe('subtitleFiles directory', () => {
    it('exists', () => {
        const dir = path.join(process.cwd(), 'subtitleFiles');
        expect(fs.existsSync(dir)).toBe(true);
    });

    it('each song folder has required files', () => {
        const files = readAllSubtitleFiles();
        for (const file of files) {
            const songDir = path.join(process.cwd(), 'subtitleFiles', file.id);
            expect(
                fs.existsSync(path.join(songDir, 'config.txt')),
                `config.txt missing for "${file.id}"`,
            ).toBe(true);
            expect(
                fs.existsSync(path.join(songDir, 'subtitle.ass')),
                `subtitle.ass missing for "${file.id}"`,
            ).toBe(true);
        }
    });
});
