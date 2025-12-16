import { KOREAN_CHARS } from '../const';
import { duemLaw } from './lib';
import { disassemble } from 'es-hangul';

type GameSetting = {
    mode: 'normal' | 'mission';
    notAgainSameChar: boolean;
    roundTime: number; // ms
}

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
    private NormalWordMap: Map<string, Set<string>> = new Map();
    private MissionWordMap: Map<string, Set<string>> = new Map();

    private gameSetting: GameSetting = {mode: 'normal', notAgainSameChar: false, roundTime: 60000};
    private nowState: null | {startChar: string, missionChar: string | null} = null;
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

    public loadWordDB(data: {word: string, theme: string[]}[], setting: Partial<GameSetting>) {
        const pattern = /[^a-zA-Z0-9가-힣ㄱ-ㅎ]/g;
        this.wordDB = data.filter(entry => entry.word.replace(pattern, '').length > 1).map(entry => ({word: entry.word.replace(pattern, ''), theme: entry.theme}));
        this.gameSetting = {...this.gameSetting, ...setting};
        this.wordSet = new Set(this.wordDB.map(entry => entry.word));
        this.wordThemeDB = new Map(this.wordDB.map(entry => [entry.word, entry.theme]));
        
        if (this.gameSetting.mode === 'normal') {
            this.NormalStartCharSet = new Set(this.wordDB.map(entry => entry.word.charAt(0)));
            this.NormalWordMap.clear();
            for (const entry of this.wordDB) {
                const startChar = entry.word.charAt(0);
                if (!this.NormalWordMap.has(startChar)) {
                    this.NormalWordMap.set(startChar, new Set());
                }
                this.NormalWordMap.get(startChar)?.add(entry.word);
            }
        } else if (this.gameSetting.mode === 'mission') {
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
            }
        }
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
        if(roundTime < 5000) return 10;
        else if(roundTime < 11000) return 9;
        else if(roundTime < 18000) return 8;
        else if(roundTime < 26000) return 7;
        else if(roundTime < 35000) return 6;
        else if(roundTime < 45000) return 5;
        else if(roundTime < 56000) return 4;
        else if(roundTime < 68000) return 3;
        else if(roundTime < 81000) return 2;
        else if(roundTime < 95000) return 1;
        else return 0;
    }

    /**
     * 시작 글자와 미션 글자를 반환하는 함수
     * 
     * @param exclusion - 제외할 시작 글자 또는 (시작 글자, 미션 글자) 쌍의 집합
     * @returns - 선택된 시작 글자와 미션 글자
     */
    public getStartChar(exclusion: Set<string | [string, string]> = new Set()): {startChar: string, missionChar: string | null}  {
        if (this.gameSetting.mode === 'normal') {
            if (this.gameSetting.notAgainSameChar && exclusion.size > 0) {
                const availableChars = new Set([...this.NormalStartCharSet].filter(char => !(exclusion as Set<string>).has(char)));
                if (availableChars.size !== 0) {
                    const randomIndex = Math.floor(Math.random() * availableChars.size);
                    const startChar = Array.from(availableChars)[randomIndex];
                    this.nowState = {startChar, missionChar: null};
                    return this.nowState;
                }
            }
            const randomIndex = Math.floor(Math.random() * this.NormalStartCharSet.size);
            this.nowState = {startChar: Array.from(this.NormalStartCharSet)[randomIndex], missionChar: null};
            return this.nowState;
        }
        else if (this.gameSetting.mode === 'mission') {
            if (this.gameSetting.notAgainSameChar && exclusion.size > 0) {
                const availablePairs = new Set([...this.MissionStartCharSet].filter(pair => !(exclusion as Set<[string, string]>).has(pair)));
                if (availablePairs.size !== 0) {
                    const randomIndex = Math.floor(Math.random() * availablePairs.size);
                    const [startChar, missionChar] = Array.from(availablePairs)[randomIndex];
                    this.nowState = {startChar, missionChar};
                    return this.nowState;
                }
            }
            const randomIndex = Math.floor(Math.random() * this.MissionStartCharSet.size);
            const [startChar, missionChar] = Array.from(this.MissionStartCharSet)[randomIndex];
            this.nowState = {startChar, missionChar};
            return this.nowState;
        }
        return {startChar: '', missionChar: null};
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
        const nextTrunTime = 15000 - 1400 * nextSpeed;
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
            this.hintStack = 0;
            this.hintWord = "";
            this.revealedIndices.clear();
            return {ok: true, wordEntry, nextChar, nextMissionChar, turnSpeed: nextSpeed, trunTime: Math.min(roundTime, nextTrunTime + 100)};
        }
    }

    public getHint(){
        if (this.nowState === null) return "";
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
        console.log('Hint word:', this.hintWord);
        let currentHint = '';
        const wordLength = this.hintWord.length;

        if (this.hintStack === 0) {
            for (let i = 0; i < wordLength; i++) {
                currentHint += disassemble(this.hintWord[i])[0];
            }
        } else if (this.hintStack === 1) {
            const maxRevealCount = Math.floor(wordLength / 3); // 최대 공개 글자 수 (1/3 이하)
            let revealedCount = this.revealedIndices.size; // 현재 공개된 수 (0일 것임)
            
            // maxRevealCount만큼 랜덤한 인덱스를 Set에 추가
            while (revealedCount < maxRevealCount) {
                const randomIndex = Math.floor(Math.random() * wordLength);
                if (!this.revealedIndices.has(randomIndex)) {
                    this.revealedIndices.add(randomIndex);
                    revealedCount++;
                }
            }

            // 힌트 생성 (공개된 인덱스는 원본 글자, 나머지는 초성)
            for (let i = 0; i < wordLength; i++) {
                if (this.revealedIndices.has(i)) {
                    currentHint += this.hintWord[i];
                } else {
                    currentHint += disassemble(this.hintWord[i])[0];
                }
            }
        } else if (this.hintStack >= 2) {
            const maxRevealCount = Math.floor(wordLength / 2); // 최대 공개 글자 수 (1/2 이하)
            let revealedCount = this.revealedIndices.size; // 현재 공개된 글자 수
            
            // maxRevealCount에 도달할 때까지 랜덤한 인덱스를 Set에 추가
            while (revealedCount < maxRevealCount) {
                const randomIndex = Math.floor(Math.random() * wordLength);
                if (!this.revealedIndices.has(randomIndex)) {
                    this.revealedIndices.add(randomIndex);
                    revealedCount++;
                }
            }
            
            // 힌트 생성 (공개된 인덱스는 원본 글자, 나머지는 초성)
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
        
    }
}

const gameManager = GameManager.getInstance();

export default gameManager;