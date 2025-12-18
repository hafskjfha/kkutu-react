import { KOREAN_CHARS, ENGLISH_CHARS, BEAT, koreanRegex, englishRegex } from '@/app/game/const';

describe('Constants', () => {
    it('should have correct Korean chars', () => {
        expect(KOREAN_CHARS).toContain('가');
        expect(KOREAN_CHARS).toHaveLength(14);
    });

    it('should have correct English chars', () => {
        expect(ENGLISH_CHARS).toContain('a');
        expect(ENGLISH_CHARS).toHaveLength(26);
    });

    it('should have correct BEAT patterns', () => {
        expect(BEAT).toHaveLength(9);
        expect(BEAT[1]).toBe("10000000");
    });

    it('should have correct regex', () => {
        expect(koreanRegex.test('가')).toBe(true);
        expect(koreanRegex.test('a')).toBe(false);
        expect(englishRegex.test('a')).toBe(true);
        expect(englishRegex.test('가')).toBe(false);
    });
});
