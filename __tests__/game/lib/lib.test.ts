import { duemLaw } from '@/app/game/lib/lib';

describe('duemLaw', () => {
    it('should apply duem law correctly for rule 1 (ㄹ -> ㄴ)', () => {
        // Rule 1: ㄹ followed by [ㅏ,ㅐ,ㅗ,ㅚ,ㅜ,ㅡ] becomes ㄴ
        expect(duemLaw('락')).toBe('낙');
        expect(duemLaw('로')).toBe('노');
        expect(duemLaw('루')).toBe('누');
        expect(duemLaw('뢰')).toBe('뇌');
    });

    it('should apply duem law correctly for rule 2 (ㄹ -> ㅇ)', () => {
        // Rule 2: ㄹ followed by [ㅑ,ㅕ,ㅖ,ㅛ,ㅠ,ㅣ] becomes ㅇ
        expect(duemLaw('량')).toBe('양');
        expect(duemLaw('려')).toBe('여');
        expect(duemLaw('례')).toBe('예');
        expect(duemLaw('료')).toBe('요');
        expect(duemLaw('류')).toBe('유');
        expect(duemLaw('리')).toBe('이');
    });

    it('should apply duem law correctly for rule 3 (ㄴ -> ㅇ)', () => {
        // Rule 3: ㄴ followed by [ㅕ,ㅛ,ㅠ,ㅣ] becomes ㅇ
        expect(duemLaw('녀')).toBe('여');
        expect(duemLaw('뇨')).toBe('요');
        expect(duemLaw('뉴')).toBe('유');
        expect(duemLaw('니')).toBe('이');
    });

    it('should not change characters that do not match rules', () => {
        expect(duemLaw('가')).toBe('가');
        expect(duemLaw('바')).toBe('바');
        // '나' (ㄴ + ㅏ) is not in rule 3 (only ㅕ,ㅛ,ㅠ,ㅣ)
        expect(duemLaw('나')).toBe('나'); 
    });

    it('should throw error for non-single character input', () => {
        expect(() => duemLaw('가나')).toThrow('한글자만 입력해주세요');
    });

    it('should return input if ignoreError is true for non-single character', () => {
        expect(duemLaw('가나', true)).toBe('가나');
    });
    
    it('should return input if it is not hangul', () => {
        expect(duemLaw('A')).toBe('A');
    });
});
