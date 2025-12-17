import { KOREAN_CHARS, ENGLISH_CHARS, englishRegex, koreanRegex } from '../const';
import { duemLaw } from './lib';
import { disassemble } from 'es-hangul';
import type { GameSetting } from '../types/game.type';


type SubminWordResult = {
    ok: false;
    reason: string;
} | {
    ok: true;
    wordEntry: {
        word: string;
        theme: string[];
    };
    nextChar: string;
    nextMissionChar: string | null;
    turnSpeed: number;
    trunTime: number;
    reason?: undefined;
}


class GameManager {
    private static instance: GameManager;
    private wordDB: {word: string, theme: string[]}[] = [];
    private wordThemeDB: Map<string, string[]> = new Map();
    private wordSet: Set<string> = new Set();
    private NormalStartCharSet: Set<string> = new Set();
    private MissionStartCharSet: Set<[string, string]> = new Set();
    private NormalEngStartCharSet: Set<string> = new Set();
    private MissionEngStartCharSet: Set<[string, string]> = new Set();
    private NormalWordMap: Map<string, Set<string>> = new Map();
    private MissionWordMap: Map<string, Set<string>> = new Map();
    private NormalEngWordMap: Map<string, Set<string>> = new Map();
    private MissionEngWordMap: Map<string, Set<string>> = new Map();

    private gameSetting: GameSetting = {lang: 'ko', mode: 'normal', hintMode: 'auto', notAgainSameChar: false, roundTime: 60000, wantStartChar: new Set()};
    private nowState: null | {startChar: string, missionChar: string | null} = null;
    private usedWords: {char: string, word: string, missionChar: string | null, useHintCount: number, isFailed?: boolean}[] = [];
    private exclusionSet: Set<string | [string, string]> = new Set();

    private hintStack: number = 0;
    private hintWord: string = "";
    private revealedIndices = new Set<number>();

    private constructor() {
        if (GameManager.instance) {
            throw new Error("Use GameManager.getInstance() to get the singleton instance.");
        }
    }

    public static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    public updateSetting(setting: Partial<GameSetting>) {
        this.gameSetting = {...this.gameSetting, ...setting};
    }

    public getSetting(): GameSetting {
        return this.gameSetting;
    }

    private getMissionKey(startChar: string, missionChar: string): string {
        return `${startChar}|${missionChar}`;
    }

    public canGameStart(): boolean {
        if (this.gameSetting.lang === 'ko') {
            if (this.gameSetting.mode === 'normal') {
                return this.NormalStartCharSet.size > 0;
            } else if (this.gameSetting.mode === 'mission') {
                return this.MissionStartCharSet.size > 0;
            } else {
                return false;
            }
        } else if (this.gameSetting.lang === 'en') {
            if (this.gameSetting.mode === 'normal') {
                return this.NormalEngStartCharSet.size > 0;
            } else if (this.gameSetting.mode === 'mission') {
                return this.MissionEngStartCharSet.size > 0;
            } else {
                return false;
            }
        }
        return false;
    }

    public loadWordDB(data: {word: string, theme: string[]}[], setting: Partial<GameSetting>) {
        const pattern = /[^a-zA-Z0-9가-힣ㄱ-ㅎ]/g;
        
        this.wordDB = data.filter(entry => entry.word.replace(pattern, '').length > 1).map(entry => ({word: entry.word.replace(pattern, '').toLowerCase(), theme: entry.theme}));
        this.gameSetting = {...this.gameSetting, ...setting};
        this.wordSet = new Set(this.wordDB.map(entry => entry.word));
        this.wordThemeDB = new Map(this.wordDB.map(entry => [entry.word, entry.theme]));
        

        this.NormalStartCharSet = new Set(this.wordDB.filter(entry => koreanRegex.test(entry.word.charAt(0))).map(entry => entry.word.charAt(0)));
        this.NormalEngStartCharSet = new Set(this.wordDB.filter(entry => englishRegex.test(entry.word.charAt(0))).map(entry => entry.word.charAt(0)));
        
        this.NormalWordMap.clear();
        for (const entry of this.wordDB) {
            const startChar = entry.word.charAt(0);
            if (koreanRegex.test(startChar)) {
                if (!this.NormalWordMap.has(startChar)) {
                    this.NormalWordMap.set(startChar, new Set());
                }
                this.NormalWordMap.get(startChar)?.add(entry.word);
            } else if (englishRegex.test(startChar)) {
                if (!this.NormalEngWordMap.has(startChar)) {
                    this.NormalEngWordMap.set(startChar, new Set());
                }
                this.NormalEngWordMap.get(startChar)?.add(entry.word);
            }
        }
        this.MissionStartCharSet.clear();
        this.MissionWordMap.clear();
        for (const entry of this.wordDB) {
            for (const mchar of KOREAN_CHARS) {
                if (entry.word.includes(mchar)) {
                    this.MissionStartCharSet.add([entry.word.charAt(0), mchar]);
                    const key = this.getMissionKey(entry.word.charAt(0), mchar);
                    if (!this.MissionWordMap.has(key)) {
                        this.MissionWordMap.set(key, new Set());
                    }
                    this.MissionWordMap.get(key)?.add(entry.word);
                }
            }
            for (const mchar of ENGLISH_CHARS) {
                if (entry.word.includes(mchar)) {
                    this.MissionEngStartCharSet.add([entry.word.charAt(0), mchar]);
                    const key = this.getMissionKey(entry.word.charAt(0), mchar);
                    if (!this.MissionEngWordMap.has(key)) {
                        this.MissionEngWordMap.set(key, new Set());
                    }
                    this.MissionEngWordMap.get(key)?.add(entry.word);
                }
            }
        }
    }

    public clearDB() {
        this.wordDB = [];
        this.wordSet.clear();
        this.wordThemeDB.clear();
        this.NormalStartCharSet.clear();
        this.MissionStartCharSet.clear();
        this.NormalEngStartCharSet.clear();
        this.MissionEngStartCharSet.clear();
        this.NormalWordMap.clear();
        this.MissionWordMap.clear();
        this.MissionEngWordMap.clear();
        this.NormalEngWordMap.clear();
    }

    public addWordToDB(word: string, theme: string[]) {
        const cleanWord = word.replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎ]/g, '').toLowerCase();
        if (cleanWord.length <= 1 || this.wordSet.has(cleanWord)) {
            return false;
        }
        this.wordDB.push({word: cleanWord, theme});
        this.wordSet.add(cleanWord);
        this.wordThemeDB.set(cleanWord, theme);
        if (koreanRegex.test(cleanWord.charAt(0))) {
            this.NormalStartCharSet.add(cleanWord.charAt(0));
            if (!this.NormalWordMap.has(cleanWord.charAt(0))) {
                this.NormalWordMap.set(cleanWord.charAt(0), new Set());
            }
            this.NormalWordMap.get(cleanWord.charAt(0))?.add(cleanWord);
            this.NormalStartCharSet.add(cleanWord.charAt(0));
            for (const mchar of KOREAN_CHARS) {
                if (cleanWord.includes(mchar)) {
                    this.MissionStartCharSet.add([cleanWord.charAt(0), mchar]);
                    const key = this.getMissionKey(cleanWord.charAt(0), mchar);
                    if (!this.MissionWordMap.has(key)) {
                        this.MissionWordMap.set(key, new Set());
                    }
                    this.MissionWordMap.get(key)?.add(cleanWord);
                }
            }
        } else if (englishRegex.test(cleanWord.charAt(0))) {
            this.NormalEngStartCharSet.add(cleanWord.charAt(0));
            if (!this.NormalEngWordMap.has(cleanWord.charAt(0))) {
                this.NormalEngWordMap.set(cleanWord.charAt(0), new Set());
            }
            this.NormalEngWordMap.get(cleanWord.charAt(0))?.add(cleanWord);
            for (const mchar of ENGLISH_CHARS) {
                if (cleanWord.includes(mchar)) {
                    this.MissionEngStartCharSet.add([cleanWord.charAt(0), mchar]);
                    const key = this.getMissionKey(cleanWord.charAt(0), mchar);
                    if (!this.MissionEngWordMap.has(key)) {
                        this.MissionEngWordMap.set(key, new Set());
                    }
                    this.MissionEngWordMap.get(key)?.add(cleanWord);
                }
            }
        }
        return true;
    }

    public editWordInDB(oldWord: string, newWord: string) {
        const cleanOldWord = oldWord.replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎ]/g, '').toLowerCase();
        const cleanNewWord = newWord.replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎ]/g, '').toLowerCase();
        if (!this.wordSet.has(cleanOldWord) || cleanNewWord.length <= 1) {
            return false;
        }
        const entryIndex = this.wordDB.findIndex(entry => entry.word === cleanOldWord);
        if (entryIndex === -1) {
            return false;
        }
        const theme = this.wordDB[entryIndex].theme;
        this.wordDB[entryIndex].word = cleanNewWord;
        this.wordSet.delete(cleanOldWord);
        this.wordSet.add(cleanNewWord);
        this.wordThemeDB.delete(cleanOldWord);
        this.wordThemeDB.set(cleanNewWord, theme);

        if (englishRegex.test(cleanNewWord.charAt(0))) {
            this.NormalEngStartCharSet.add(cleanNewWord.charAt(0));
            if (!this.NormalEngWordMap.has(cleanNewWord.charAt(0))) {
                this.NormalEngWordMap.set(cleanNewWord.charAt(0), new Set());
            }
            this.NormalEngWordMap.get(cleanNewWord.charAt(0))?.add(cleanNewWord);
        } else if (koreanRegex.test(cleanNewWord.charAt(0))) {
            this.NormalStartCharSet.add(cleanNewWord.charAt(0));
            if (!this.NormalWordMap.has(cleanNewWord.charAt(0))) {
                this.NormalWordMap.set(cleanNewWord.charAt(0), new Set());
            }
            this.NormalWordMap.get(cleanNewWord.charAt(0))?.add(cleanNewWord);
        }

        if (koreanRegex.test(cleanOldWord.charAt(0))) {
            this.NormalWordMap.get(cleanOldWord.charAt(0))?.delete(cleanOldWord);
            if ((this.NormalWordMap.get(cleanOldWord.charAt(0)) ?? new Set()).size === 0) {
                this.NormalStartCharSet.delete(cleanOldWord.charAt(0));
            }
        } else if (englishRegex.test(cleanOldWord.charAt(0))) {
            this.NormalEngWordMap.get(cleanOldWord.charAt(0))?.delete(cleanOldWord);
            if ((this.NormalEngWordMap.get(cleanOldWord.charAt(0)) ?? new Set()).size === 0) {
                this.NormalEngStartCharSet.delete(cleanOldWord.charAt(0));
            }
        }
        for (const mchar of KOREAN_CHARS) {
            const key = this.getMissionKey(cleanOldWord.charAt(0), mchar);
            this.MissionWordMap.get(key)?.delete(cleanOldWord);
            if ((this.MissionWordMap.get(key) ?? new Set()).size === 0) {
                this.MissionStartCharSet.delete([cleanOldWord.charAt(0), mchar]);
            }

            const key2 = this.getMissionKey(cleanNewWord.charAt(0), mchar);
            if (cleanNewWord.includes(mchar)) {
                this.MissionStartCharSet.add([cleanNewWord.charAt(0), mchar]);
                if (!this.MissionWordMap.has(key2)) {
                    this.MissionWordMap.set(key2, new Set());
                }
                this.MissionWordMap.get(key2)?.add(cleanNewWord);
            }
        }
        for (const mchar of ENGLISH_CHARS) {
            const key = this.getMissionKey(cleanOldWord.charAt(0), mchar);
            this.MissionEngWordMap.get(key)?.delete(cleanOldWord);
            if ((this.MissionEngWordMap.get(key) ?? new Set()).size === 0) {
                this.MissionEngStartCharSet.delete([cleanOldWord.charAt(0), mchar]);
            }

            const key2 = this.getMissionKey(cleanNewWord.charAt(0), mchar);
            if (cleanNewWord.includes(mchar)) {
                this.MissionEngStartCharSet.add([cleanNewWord.charAt(0), mchar]);
                if (!this.MissionEngWordMap.has(key2)) {
                    this.MissionEngWordMap.set(key2, new Set());
                }
                this.MissionEngWordMap.get(key2)?.add(cleanNewWord);
            }
        }
        return true;
    }

    public deleteWordFromDB(word: string) {
        const cleanWord = word.replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎ]/g, '').toLowerCase();
        if (!this.wordSet.has(cleanWord)) {
            return false;
        }
        this.wordDB = this.wordDB.filter(entry => entry.word !== cleanWord);
        this.wordSet.delete(cleanWord);
        this.wordThemeDB.delete(cleanWord);
        if (koreanRegex.test(cleanWord.charAt(0))) {
            this.NormalWordMap.get(cleanWord.charAt(0))?.delete(cleanWord);
            if ((this.NormalWordMap.get(cleanWord.charAt(0)) ?? new Set()).size === 0) {
                this.NormalStartCharSet.delete(cleanWord.charAt(0));
            }
        } else if (englishRegex.test(cleanWord.charAt(0))) {
            this.NormalEngWordMap.get(cleanWord.charAt(0))?.delete(cleanWord);
            if ((this.NormalEngWordMap.get(cleanWord.charAt(0)) ?? new Set()).size === 0) {
                this.NormalEngStartCharSet.delete(cleanWord.charAt(0));
            }
        }
        for (const mchar of KOREAN_CHARS) {
            const key = this.getMissionKey(cleanWord.charAt(0), mchar);
            this.MissionWordMap.get(key)?.delete(cleanWord);
            if ((this.MissionWordMap.get(key) ?? new Set()).size === 0) {
                this.MissionStartCharSet.delete([cleanWord.charAt(0), mchar]);
            }
        }
        for (const mchar of ENGLISH_CHARS) {
            const key = this.getMissionKey(cleanWord.charAt(0), mchar);
            this.MissionEngWordMap.get(key)?.delete(cleanWord);
            if ((this.MissionEngWordMap.get(key) ?? new Set()).size === 0) {
                this.MissionEngStartCharSet.delete([cleanWord.charAt(0), mchar]);
            }
        }
        return true;
    }

    public isValidWord(word: string): boolean {
        if (this.nowState === null) return false;
        return word.length > 1 && this.wordSet.has(word) && [this.nowState.startChar, duemLaw(this.nowState.startChar)].includes(word.charAt(0));
    }

    public getWordTheme(word: string): string[] {
        return this.wordThemeDB.get(word) ?? [];
    }
    
    /**
     * 턴 속도를 반환하는 함수
     * 
     * @param roundTime - 현재 라운드 시간 (ms)
     * @returns - 턴 속도 (0~10)
     */
    public getTurnSpeed(roundTime: number): number {
        // If roundTime is 0 (convention for unlimited) or non-finite (Infinity),
        // treat it as unlimited and return the slowest speed (0).
        if (roundTime === 0 || !isFinite(roundTime)) return 0;
        if (roundTime < 5000) return 10;
        else if (roundTime < 11000) return 9;
        else if (roundTime < 18000) return 8;
        else if (roundTime < 26000) return 7;
        else if (roundTime < 35000) return 6;
        else if (roundTime < 45000) return 5;
        else if (roundTime < 56000) return 4;
        else if (roundTime < 68000) return 3;
        else if (roundTime < 81000) return 2;
        else if (roundTime < 95000) return 1;
        else return 0;
    }

    /**
     * 시작 글자와 미션 글자를 반환하는 함수
     * 
     * @param exclusion - 제외할 시작 글자 또는 (시작 글자, 미션 글자) 쌍의 집합
     * @returns - 선택된 시작 글자와 미션 글자
     */
    public getStartChar(exclusion: Set<string | [string, string]> = new Set()): {startChar: string, missionChar: string | null}  {
        if (this.gameSetting.lang === 'ko') {
            if (this.gameSetting.mode === 'normal') {
                if (this.gameSetting.notAgainSameChar && exclusion.size > 0) {
                    const availableChars = new Set([...this.NormalStartCharSet.intersection(this.gameSetting.wantStartChar)].filter(char => !(exclusion as Set<string>).has(char)));
                    if (availableChars.size !== 0) {
                        const randomIndex = Math.floor(Math.random() * availableChars.size);
                        const startChar = Array.from(availableChars)[randomIndex];
                        this.nowState = {startChar, missionChar: null};
                    }
                }
                const randomIndex = Math.floor(Math.random() * this.NormalStartCharSet.size);
                this.nowState = {startChar: Array.from(this.NormalStartCharSet)[randomIndex], missionChar: null};
            }
            else if (this.gameSetting.mode === 'mission') {
                if (this.gameSetting.notAgainSameChar && exclusion.size > 0) {
                    const availablePairs = new Set([...this.MissionStartCharSet].filter(pair => !(exclusion as Set<[string, string]>).has(pair) && this.gameSetting.wantStartChar.has(pair[0])));
                    if (availablePairs.size !== 0) {
                        const randomIndex = Math.floor(Math.random() * availablePairs.size);
                        const [startChar, missionChar] = Array.from(availablePairs)[randomIndex];
                        this.nowState = {startChar, missionChar};
                    }
                }
                const randomIndex = Math.floor(Math.random() * this.MissionStartCharSet.size);
                const [startChar, missionChar] = Array.from(this.MissionStartCharSet)[randomIndex];
                this.nowState = {startChar, missionChar};
            } else {
                this.nowState = {startChar: '', missionChar: null};
            }
        } else if (this.gameSetting.lang === 'en') {
            if (this.gameSetting.mode === 'normal') {
                if (this.gameSetting.notAgainSameChar && exclusion.size > 0) {
                    const availableChars = new Set([...this.NormalEngStartCharSet].filter(char => !(exclusion as Set<string>).has(char)));
                    if (availableChars.size !== 0) {
                        const randomIndex = Math.floor(Math.random() * availableChars.size);
                        const startChar = Array.from(availableChars)[randomIndex];
                        this.nowState = {startChar, missionChar: null};
                    }
                }
                const randomIndex = Math.floor(Math.random() * this.NormalEngStartCharSet.size);
                this.nowState = {startChar: Array.from(this.NormalEngStartCharSet)[randomIndex], missionChar: null};
            } else if (this.gameSetting.mode === 'mission') {
                if (this.gameSetting.notAgainSameChar && exclusion.size > 0) {
                    const availablePairs = new Set([...this.MissionEngStartCharSet].filter(pair => !(exclusion as Set<[string, string]>).has(pair)));
                    if (availablePairs.size !== 0) {
                        const randomIndex = Math.floor(Math.random() * availablePairs.size);
                        const [startChar, missionChar] = Array.from(availablePairs)[randomIndex];
                        this.nowState = {startChar, missionChar};
                    }
                }
                const randomIndex = Math.floor(Math.random() * this.MissionEngStartCharSet.size);
                const [startChar, missionChar] = Array.from(this.MissionEngStartCharSet)[randomIndex];
                this.nowState = {startChar, missionChar};
            } else {
                this.nowState = {startChar: '', missionChar: null};
            }
        } else {
            this.nowState = {startChar: '', missionChar: null};
        }
        return this.nowState
    }

    public getCurrentState() {
        return this.nowState;
    }

    /**
     * 게임을 시작하는 함수
     * 
     */
    public gameStart(){
        this.nowState = null;
        this.hintStack = 0;
        this.hintWord = "";
        this.revealedIndices.clear();
        this.exclusionSet.clear();
        const nextSpeed = this.getTurnSpeed(this.gameSetting.roundTime);
        let nextTrunTime = 15000 - 1400 * nextSpeed;
        this.usedWords = [];
        if (this.gameSetting.roundTime === 0 || !isFinite(this.gameSetting.roundTime)) {
            // when round is unlimited, make turn time unlimited as well
            nextTrunTime = Infinity;
        }
        return {...this.getStartChar(), turnTime: nextTrunTime, turnSpeed: nextSpeed};
    }

    /**
     * 단어의 입력을 처리하는 함수
     * 
     * @param word - 입력된 단어
     * @param roundTime - 현재 라운드 시간 (ms)
     * @returns - 단어 제출 결과
     */
    public submitWord(word: string, roundTime: number): SubminWordResult {
        const startChar = this.nowState ? this.nowState.startChar : '';
        const missionChar = this.nowState ? this.nowState.missionChar : null;
        if (!this.isValidWord(word) || this.nowState === null) {
            return {ok: false, reason: ""};
        } else if (this.gameSetting.mode === "mission" && this.nowState.missionChar && !word.includes(this.nowState.missionChar)) {
            return {ok: false, reason: "미션 글자 미포함!"};
        } else {
            const wordTheme = this.getWordTheme(word);
            const wordEntry = {word, theme: wordTheme};
            if (this.gameSetting.notAgainSameChar) {
                this.exclusionSet.add(this.gameSetting.mode === 'normal' ? word.charAt(0) : [word.charAt(0), this.nowState!.missionChar!]);
            }
            const nextSpeed = this.getTurnSpeed(roundTime);
            const nextTrunTime = 15000 - 1400 * nextSpeed;
            const {startChar: nextChar, missionChar: nextMissionChar} = this.getStartChar(this.exclusionSet);
            if (this.gameSetting.notAgainSameChar) this.exclusionSet.add(this.gameSetting.mode === 'normal' ? nextChar : [nextChar, nextMissionChar!]);
            const usedHintCount = this.hintStack;
            this.hintStack = 0;
            this.hintWord = "";
            this.revealedIndices.clear();
            // If incoming roundTime is 0 (unlimited) or non-finite, return unlimited turn time as well.
            const actualTrunTime = (roundTime === 0 || !isFinite(roundTime)) ? Infinity : Math.min(roundTime, nextTrunTime + 100);
            this.usedWords.push({char: startChar, word, missionChar: missionChar, useHintCount: usedHintCount});
            return {ok: true, wordEntry, nextChar, nextMissionChar, turnSpeed: nextSpeed, trunTime: actualTrunTime};
        }
    }

    public getHint(){
        if (this.nowState === null) return "";
        if (this.gameSetting.hintMode === 'auto') {
            if (this.gameSetting.mode === 'normal') {
                const hintWords = Array.from(this.NormalWordMap.get(this.nowState.startChar) || []);
                console.log('Hint words for', this.nowState.startChar, ':', hintWords);
                if (hintWords.length > 0) {
                    const randomIndex = Math.floor(Math.random() * hintWords.length);
                    return `${hintWords[randomIndex]}`;
                } else {
                    return "";
                }
            } else if (this.gameSetting.mode === 'mission') {
                const hintWords = Array.from(this.MissionWordMap.get(this.getMissionKey(this.nowState.startChar, this.nowState.missionChar!)) || []);
                if (hintWords.length > 0) {
                    const randomIndex = Math.floor(Math.random() * hintWords.length);
                    return `${hintWords[randomIndex]}`;
                } else {
                    return "";
                }
            } else {
                return "";
            }
        } else {
            if (this.gameSetting.mode === 'normal') {
                const hintWords = Array.from(this.NormalWordMap.get(this.nowState.startChar) || []);
                if (hintWords.length > 0) {
                    const longestWord = hintWords.reduce((a, b) => a.length >= b.length ? a : b, "");
                    return `${longestWord}`;
                } else {
                    return "";
                }
            } else if (this.gameSetting.mode === 'mission') {
                const hintWords = Array.from(this.MissionWordMap.get(this.getMissionKey(this.nowState.startChar, this.nowState.missionChar!)) || []);
                if (hintWords.length > 0) {
                    const manyIncludeWord = hintWords.reduce((a, b) => {
                        const aCount = a.split(this.nowState!.missionChar!).length - 1;
                        const bCount = b.split(this.nowState!.missionChar!).length - 1;
                        if (aCount !== bCount) {
                            return aCount >= bCount ? a : b;
                        } else {
                            return a.length >= b.length ? a : b;
                        }
                    }, "");
                    return `${manyIncludeWord}`;
                }
                return "";
            } else {
                return "";
            }
        }
    }

    public gameEndHint() {
        if (this.hintWord) return this.hintWord;
        this.hintWord = this.getHint();
        return this.hintWord;
    }

    public getHintWord() {
        if (this.nowState === null) return null;
        if (this.hintStack === 0) {
            this.hintWord = this.getHint();
        }

        let currentHint = '';
        const wordLength = this.hintWord.length;

        const revealRandomIndices = (targetCount: number) => {
            let revealedCount = this.revealedIndices.size;
            while (revealedCount < targetCount) {
                const randomIndex = Math.floor(Math.random() * wordLength);
                if (!this.revealedIndices.has(randomIndex)) {
                    this.revealedIndices.add(randomIndex);
                    revealedCount++;
                }
            }
        };

        if (this.hintStack === 0) {
            for (let i = 0; i < wordLength; i++) {
                currentHint += disassemble(this.hintWord[i])[0];
            }
        } else if (this.hintStack === 1) {
            const maxRevealCount = Math.floor(wordLength / 3); // 1/3
            revealRandomIndices(maxRevealCount);
            for (let i = 0; i < wordLength; i++) {
                if (this.revealedIndices.has(i)) {
                    currentHint += this.hintWord[i];
                } else {
                    currentHint += disassemble(this.hintWord[i])[0];
                }
            }
        } else if (this.hintStack === 2) {
            const maxRevealCount = Math.floor(wordLength / 2); // 1/2
            revealRandomIndices(maxRevealCount);
            for (let i = 0; i < wordLength; i++) {
                if (this.revealedIndices.has(i)) {
                    currentHint += this.hintWord[i];
                } else {
                    currentHint += disassemble(this.hintWord[i])[0];
                }
            }
        } else if (this.hintStack === 3) {
            const maxRevealCount = Math.floor((wordLength * 2) / 3); // 2/3
            revealRandomIndices(maxRevealCount);
            for (let i = 0; i < wordLength; i++) {
                if (this.revealedIndices.has(i)) {
                    currentHint += this.hintWord[i];
                } else {
                    currentHint += disassemble(this.hintWord[i])[0];
                }
            }
        } else if (this.hintStack >= 4) {
            // fully reveal the word when hintStack >= 4
            currentHint = this.hintWord;
        } else {
            // default for other cases (e.g., hintStack === 4): reveal up to half
            const maxRevealCount = Math.floor(wordLength / 2);
            revealRandomIndices(maxRevealCount);
            for (let i = 0; i < wordLength; i++) {
                if (this.revealedIndices.has(i)) {
                    currentHint += this.hintWord[i];
                } else {
                    currentHint += disassemble(this.hintWord[i])[0];
                }
            }
        }
        this.hintStack++;

        return currentHint;
    }

    public gameEnd() {
        if (!this.usedWords[0]?.isFailed) {
            this.usedWords.push({char: this.nowState ? this.nowState.startChar : '', word: this.hintWord, missionChar: this.nowState ? this.nowState.missionChar : null, useHintCount: this.hintStack, isFailed: true});
        }
        return { usedWords: this.usedWords }
    }
}

const gameManager = GameManager.getInstance();

export default gameManager;