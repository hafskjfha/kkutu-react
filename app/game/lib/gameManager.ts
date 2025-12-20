import { disassemble } from 'es-hangul';
import type { GameSetting, SubminWordResult, CurrentState, UsedWord } from '../types/game.type';
import { wordService } from '../services/WordService';
import { GameLogic } from './GameLogic';

/**
 * 게임 진행 상태 및 로직을 관리하는 매니저 클래스
 * Singleton 패턴 적용
 * 주요 로직은 WordService와 GameLogic으로 위임하여 SoC 원칙 준수
 */
class GameManager {
    private static instance: GameManager;

    private gameSetting: GameSetting = {
        lang: 'ko', 
        mode: 'normal', 
        hintMode: 'auto', 
        notAgainSameChar: false, 
        roundTime: 60000, 
        wantStartChar: new Set()
    };
    
    private nowState: CurrentState = null;
    private usedWords: UsedWord[] = [];
    private exclusionSet: Set<string | [string, string]> = new Set();

    private hintStack: number = 0;
    private hintWord: string = "";
    private revealedIndices = new Set<number>();

    private constructor() {
        // Singleton
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

    public canGameStart(): boolean {
        if (this.gameSetting.lang === 'ko') {
            if (this.gameSetting.mode === 'normal') {
                return wordService.NormalStartCharSet.size > 0;
            } else if (this.gameSetting.mode === 'mission') {
                return wordService.MissionStartCharSet.size > 0;
            }
        } else if (this.gameSetting.lang === 'en') {
            if (this.gameSetting.mode === 'normal') {
                return wordService.NormalEngStartCharSet.size > 0;
            } else if (this.gameSetting.mode === 'mission') {
                return wordService.MissionEngStartCharSet.size > 0;
            }
        }
        return false;
    }

    public loadWordDB(data: {word: string, theme: string[]}[], setting: Partial<GameSetting>) {
        wordService.loadWordDB(data);
        this.updateSetting(setting);
    }

    public clearDB() {
        wordService.clearDB();
    }

    public addWordToDB(word: string, theme: string[]) {
        return wordService.addWordToDB(word, theme);
    }

    public editWordInDB(oldWord: string, newWord: string) {
        return wordService.editWordInDB(oldWord, newWord);
    }

    public deleteWordFromDB(word: string) {
        return wordService.deleteWordFromDB(word);
    }

    public isValidWord(word: string): boolean {
        return GameLogic.isValidWord(word, this.nowState, wordService);
    }

    public getWordTheme(word: string): string[] {
        return wordService.getWordTheme(word);
    }
    
    public getTurnSpeed(roundTime: number): number {
        return GameLogic.getTurnSpeed(roundTime);
    }

    public getStartChar(exclusion: Set<string | [string, string]> = new Set()): {startChar: string, missionChar: string | null}  {
        const result = GameLogic.getStartChar(this.gameSetting, wordService, exclusion);
        this.nowState = result;
        return result;
    }

    public getCurrentState() {
        return this.nowState;
    }

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
            nextTrunTime = Infinity;
        }
        
        const startState = this.getStartChar();
        return {...startState, turnTime: nextTrunTime, turnSpeed: nextSpeed};
    }

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
            
            if (this.gameSetting.notAgainSameChar) {
                this.exclusionSet.add(this.gameSetting.mode === 'normal' ? nextChar : [nextChar, nextMissionChar!]);
            }
            
            const usedHintCount = this.hintStack;
            this.hintStack = 0;
            this.hintWord = "";
            this.revealedIndices.clear();
            
            const actualTrunTime = (roundTime === 0 || !isFinite(roundTime)) ? Infinity : Math.min(roundTime, nextTrunTime + 100);
            
            this.usedWords.push({char: startChar, word, missionChar: missionChar, useHintCount: usedHintCount});
            
            return {ok: true, wordEntry, nextChar, nextMissionChar, turnSpeed: nextSpeed, trunTime: actualTrunTime};
        }
    }

    public getHint(){
        if (this.nowState === null) return "";
        
        if (this.gameSetting.hintMode === 'auto') {
            if (this.gameSetting.mode === 'normal') {
                const hintWords = Array.from(wordService.NormalWordMap.get(this.nowState.startChar) || []);
                if (hintWords.length > 0) {
                    const randomIndex = Math.floor(Math.random() * hintWords.length);
                    return `${hintWords[randomIndex]}`;
                }
            } else if (this.gameSetting.mode === 'mission') {
                const key = wordService.getMissionKey(this.nowState.startChar, this.nowState.missionChar!);
                const hintWords = Array.from(wordService.MissionWordMap.get(key) || []);
                if (hintWords.length > 0) {
                    const randomIndex = Math.floor(Math.random() * hintWords.length);
                    return `${hintWords[randomIndex]}`;
                }
            }
        } else {
            if (this.gameSetting.mode === 'normal') {
                const hintWords = Array.from(wordService.NormalWordMap.get(this.nowState.startChar) || []);
                if (hintWords.length > 0) {
                    const longestWord = hintWords.reduce((a, b) => a.length >= b.length ? a : b, "");
                    return `${longestWord}`;
                }
            } else if (this.gameSetting.mode === 'mission') {
                const hintWords = Array.from(wordService.MissionWordMap.get(wordService.getMissionKey(this.nowState.startChar, this.nowState.missionChar!)) || []);
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
            }
        }
        return "";
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
            const maxRevealCount = Math.floor(wordLength / 3);
            revealRandomIndices(maxRevealCount);
            for (let i = 0; i < wordLength; i++) {
                if (this.revealedIndices.has(i)) {
                    currentHint += this.hintWord[i];
                } else {
                    currentHint += disassemble(this.hintWord[i])[0];
                }
            }
        } else if (this.hintStack === 2) {
            const maxRevealCount = Math.floor(wordLength / 2);
            revealRandomIndices(maxRevealCount);
            for (let i = 0; i < wordLength; i++) {
                if (this.revealedIndices.has(i)) {
                    currentHint += this.hintWord[i];
                } else {
                    currentHint += disassemble(this.hintWord[i])[0];
                }
            }
        } else if (this.hintStack === 3) {
            const maxRevealCount = Math.floor((wordLength * 2) / 3);
            revealRandomIndices(maxRevealCount);
            for (let i = 0; i < wordLength; i++) {
                if (this.revealedIndices.has(i)) {
                    currentHint += this.hintWord[i];
                } else {
                    currentHint += disassemble(this.hintWord[i])[0];
                }
            }
        } else if (this.hintStack >= 4) {
            currentHint = this.hintWord;
        } else {
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
