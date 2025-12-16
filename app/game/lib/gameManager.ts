import { KOREAN_CHARS } from '../const';
import { duemLaw } from './lib'

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

    private gameSetting: GameSetting = {mode: 'normal', notAgainSameChar: false, roundTime: 60000};
    private nowState: null | {startChar: string, missionChar: string | null} = null;
    private exclusionSet: Set<string | [string, string]> = new Set();

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

    public loadWordDB(data: {word: string, theme: string[]}[], setting: Partial<GameSetting>) {
        this.wordDB = data;
        this.gameSetting = {...this.gameSetting, ...setting};
        this.wordSet = new Set(data.map(entry => entry.word));
        this.wordThemeDB = new Map(data.map(entry => [entry.word, entry.theme]));
        if (this.gameSetting.mode === 'normal') {
            this.NormalStartCharSet = new Set(data.map(entry => entry.word.charAt(0)));
        } else if (this.gameSetting.mode === 'mission') {
            for (const entry of data) {
                for (const mchar of KOREAN_CHARS) {
                    if (entry.word.includes(mchar)) {
                        this.MissionStartCharSet.add([entry.word.charAt(0), mchar]);
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
            return {ok: true, wordEntry, nextChar, nextMissionChar, turnSpeed: nextSpeed, trunTime: Math.min(roundTime, nextTrunTime + 100)};
        }
    }
}

const gameManager = GameManager.getInstance();

export default gameManager;