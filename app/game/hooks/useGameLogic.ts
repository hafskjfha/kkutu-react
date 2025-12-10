import { useState, useEffect, useRef } from 'react';
import { useChat } from './useChat';
import { soundManager, stopAllSounds } from '../lib/sound';

const KOREAN_CHARS = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하'];

const getRandomChar = () => {
  return KOREAN_CHARS[Math.floor(Math.random() * KOREAN_CHARS.length)];
};

const BEAT = [
  null,
  "10000000",
  "10001000",
  "10010010",
  "10011010",
  "11011010",
  "11011110",
  "11011111",
  "11111111"
];

const TURN_TIME_LIMIT = 5; // 턴 제한시간 5초
const ROUND_TIME_LIMIT = 120; // 라운드 제한시간 120초

/**
 * 게임의 핵심 로직을 관리하는 커스텀 훅
 */
export const useGameLogic = () => {
  const { chatInput, setChatInput } = useChat();
  const [word, setWord] = useState("/시작을 입력하면 게임시작!");
  const [isFail, setIsFail] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentChar, setCurrentChar] = useState("");
  const [chainCount, setChainCount] = useState(0);
  const [turnTime, setTurnTime] = useState(TURN_TIME_LIMIT);
  const [roundTime, setRoundTime] = useState(ROUND_TIME_LIMIT);
  const [isPaused, setIsPaused] = useState(false);
  const [missionChar, setMissionChar] = useState(getRandomChar());
  const [historyItems, setHistoryItems] = useState<{theme: string[]; word: string}[]>([]);
  const [inputVisible, setInputVisible] = useState(true);
  const [turnInstant, setTurnInstant] = useState(false);
  const [animatingWord, setAnimatingWord] = useState<string | null>(null);
  const [visibleChars, setVisibleChars] = useState<boolean[]>([]);
  const [pulseOn, setPulseOn] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const failTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const beatTimeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const hadFocusRef = useRef<boolean>(false);
  const prevInputVisibleRef = useRef<boolean>(inputVisible);

  const safeFocusHead = () => {
    if (typeof document === 'undefined') return;
    const chatEl = document.getElementById('TalkX');
    const active = document.activeElement as HTMLElement | null;
    const chatHasFocus = chatEl && active === chatEl;
    if (hadFocusRef.current || !chatHasFocus) {
      inputRef.current?.focus();
      hadFocusRef.current = false;
    }
  };

  /**
   * 게임 종료 처리
   */
  const endGame = () => {
    try { stopAllSounds(); } catch (e) {}
    try { soundManager.play('timeout'); } catch (e) {}
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (failTimeoutRef.current) {
      clearTimeout(failTimeoutRef.current);
      failTimeoutRef.current = null;
    }
    
    beatTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    beatTimeoutRefs.current = [];

    setIsGameStarted(false);
    setIsPaused(true);
    setIsFail(false);
    setWord(`게임종료! 성공 단어수 ${chainCount}`);
    setInputVisible(true);
    setAnimatingWord(null);
  };

  // 타이머 로직
  useEffect(() => {
    if (isGameStarted && !isPaused) {
      timerRef.current = setInterval(() => {
        setTurnTime((prev) => {
          const newVal = Math.max(0, +(prev - 0.05).toFixed(2));
          if (newVal <= 0) {
            endGame();
            return 0;
          }
          return newVal;
        });
        setRoundTime((prev) => {
          const newVal = Math.max(0, +(prev - 0.05).toFixed(2));
          if (newVal <= 0) {
            endGame();
            return 0;
          }
          return newVal;
        });
      }, 50);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isGameStarted, isPaused, chainCount]);

  // 입력창 포커스 관리
  useEffect(() => {
    const prev = prevInputVisibleRef.current;
    // became visible
    if (!prev && inputVisible) {
      // if chat currently has focus and head did not have focus before hide,
      // do not steal focus. If head had focus before hide, restore it.
      if (typeof document === 'undefined') return;
      const chatEl = document.getElementById('TalkX');
      const active = document.activeElement as HTMLElement | null;
      const chatHasFocus = chatEl && active === chatEl;
      if (hadFocusRef.current || !chatHasFocus) {
        const rafId = requestAnimationFrame(() => {
          inputRef.current?.focus();
          hadFocusRef.current = false;
        });
        prevInputVisibleRef.current = inputVisible;
        return () => cancelAnimationFrame(rafId);
      }
      prevInputVisibleRef.current = inputVisible;
      return;
    }

    // became hidden
    if (prev && !inputVisible) {
      if (typeof document !== 'undefined') {
        hadFocusRef.current = document.activeElement === inputRef.current;
      }
    }

    prevInputVisibleRef.current = inputVisible;
  }, [inputVisible]);

  /**
   * 새로운 턴 시작
   */
  const startNewCycle = () => {
    const newChar = getRandomChar();
    setCurrentChar(newChar);
    setWord(newChar);
    setIsFail(false);
    setTurnInstant(true);
    setTurnTime(TURN_TIME_LIMIT);
    requestAnimationFrame(() => {
      setTurnInstant(false);
    });
    safeFocusHead();
  };

  /**
   * 사용자 입력 처리
   */
  const handleInput = (input: string) => {
    if (input === '/시작') {
      setHistoryItems([]);
      setRoundTime(ROUND_TIME_LIMIT);
      setTurnTime(TURN_TIME_LIMIT);
      setChatInput('');
      setIsPaused(true);
      setInputVisible(false);
      setWord('게임이 곧 시작됩니다');
      
      try {
        soundManager.playWithEnd('game_start', () => {
          let cycleStarted = false;
          try {
            startNewCycle();
            cycleStarted = true;
            soundManager.playWithEnd('round_start', () => {
              setIsGameStarted(true);
              setIsPaused(false);
              setInputVisible(true);
              try { soundManager.play('T5'); } catch (e) {}
            });
          } catch (e) {
            setIsGameStarted(true);
            setIsPaused(false);
            setInputVisible(true);
            try { soundManager.play('T5'); } catch (e) {}
            if (!cycleStarted) startNewCycle();
          }
        });
      } catch (e) {
        setIsGameStarted(true);
        setIsPaused(false);
        startNewCycle();
      }
      return;
    }

    if (!isGameStarted) {
      setChatInput('');
      return;
    }

    if (input.startsWith(currentChar)) {
      try { soundManager.stop('fail'); } catch (e) {}
      if (failTimeoutRef.current) {
        clearTimeout(failTimeoutRef.current);
        failTimeoutRef.current = null;
      }
      
      beatTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      beatTimeoutRefs.current = [];
      
      setIsFail(false);
      setChatInput('');
      setChainCount((v) => v + 1);
      setInputVisible(false);
      
      setHistoryItems((prev) => {
        const newHistory = [{ theme: ['자유'], word: input }, ...prev];
        return newHistory.slice(0, 5);
      });
      
      const hasMissionChar = input.includes(missionChar);
      setIsPaused(true);
      
      const wordLength = input.length;
      if (wordLength <= 8 && BEAT[wordLength]) {
        const beatPattern = BEAT[wordLength];
        try { soundManager.stop('T5'); } catch (e) {}
        setWord(input);
        setAnimatingWord(input);
        const initialVisible = new Array(wordLength).fill(false);
        setVisibleChars(initialVisible);
        
        let beatIndex = 0;
        const intervalTime = 100;
        
        for (let i = 0; i < beatPattern.length; i++) {
          if (beatPattern[i] === '1') {
            const currentBeatIndex = beatIndex;
            const timeout = setTimeout(() => {
              setVisibleChars(prev => {
                const newVisible = [...prev];
                newVisible[currentBeatIndex] = true;
                return newVisible;
              });
              try {
                soundManager.playOnce('As4');
                const char = input[currentBeatIndex];
                if (char === missionChar) {
                  soundManager.play('mission');
                }
              } catch (e) {}
            }, i * intervalTime);
            beatTimeoutRefs.current.push(timeout);
            beatIndex++;
          }
        }
        
        const totalAnimationTime = beatPattern.length * intervalTime + 120;
        const finalTimeout = setTimeout(() => {
          try { soundManager.play('K1'); } catch(e) {}

          const runPulse = (repeats = 2) => {
            let total = 0;
            for (let r = 0; r < repeats; r++) {
              const on = setTimeout(() => setPulseOn(true), total);
              beatTimeoutRefs.current.push(on);
              total += 80;
              const off = setTimeout(() => setPulseOn(false), total);
              beatTimeoutRefs.current.push(off);
              total += 120;
            }
            return total;
          };

          const pulseDuration = runPulse(2);
          const cleanupTimeout = setTimeout(() => {
            setAnimatingWord(null);
            if (hasMissionChar) {
              setMissionChar(getRandomChar());
            }
            setIsPaused(false);
            try { soundManager.play('T5'); } catch (e) {}
            startNewCycle();
            setInputVisible(true);
            setTimeout(() => {
              safeFocusHead();
            }, 0);
          }, pulseDuration);
          beatTimeoutRefs.current.push(cleanupTimeout);
        }, totalAnimationTime);
        beatTimeoutRefs.current.push(finalTimeout);
      } else if (wordLength >= 9) {
        try { soundManager.stop('T5'); } catch (e) {}
        setWord(input);
        setAnimatingWord(input);
        const initialVisible = new Array(wordLength).fill(false);
        setVisibleChars(initialVisible);
        
        const intervalTime = Math.floor((TURN_TIME_LIMIT / 12 / wordLength) * 1000);
        
        for (let i = 0; i < wordLength; i++) {
          const timeout = setTimeout(() => {
            setVisibleChars(prev => {
              const newVisible = [...prev];
              newVisible[i] = true;
              return newVisible;
            });
            try {
              soundManager.play('Al');
            } catch (e) {}
          }, i * intervalTime);
          beatTimeoutRefs.current.push(timeout);
        }
        
        const totalAnimationTime = wordLength * intervalTime + 120;
        const finalTimeout = setTimeout(() => {
          try { soundManager.play('K1'); } catch(e) {}
          const runPulse = (repeats = 2) => {
            let total = 0;
            for (let r = 0; r < repeats; r++) {
              const on = setTimeout(() => setPulseOn(true), total);
              beatTimeoutRefs.current.push(on);
              total += 80;
              const off = setTimeout(() => setPulseOn(false), total);
              beatTimeoutRefs.current.push(off);
              total += 120;
            }
            return total;
          };

          const pulseDuration = runPulse(2);
          const cleanup = setTimeout(() => {
            setAnimatingWord(null);
            if (hasMissionChar) {
              setMissionChar(getRandomChar());
            }
            setIsPaused(false);
            try { soundManager.play('T5'); } catch (e) {}
            startNewCycle();
            setInputVisible(true);
            setTimeout(() => {
              safeFocusHead();
            }, 0);
          }, pulseDuration);
          beatTimeoutRefs.current.push(cleanup);
        }, totalAnimationTime);
        beatTimeoutRefs.current.push(finalTimeout);
      } else {
        setWord(input);
        setAnimatingWord(null);
        setTimeout(() => {
          if (hasMissionChar) {
            setMissionChar(getRandomChar());
          }
          setIsPaused(false);
          try { soundManager.play('T5'); } catch (e) {}
          startNewCycle();
          setInputVisible(true);
          setTimeout(() => {
            safeFocusHead();
          }, 0);
        }, 2000);
      }
    } else {
      if (failTimeoutRef.current) {
        clearTimeout(failTimeoutRef.current);
        failTimeoutRef.current = null;
      }
      
      setWord(input);
      setIsFail(true);
      setChatInput('');
      try { soundManager.play('fail'); } catch (e) {}
      failTimeoutRef.current = setTimeout(() => {
        setIsFail(false);
        setWord(currentChar);
        failTimeoutRef.current = null;
      }, 2000);
    }
  };

  return {
    word,
    isFail,
    isGameStarted,
    chainCount,
    turnTime,
    roundTime,
    missionChar,
    historyItems,
    inputVisible,
    turnInstant,
    animatingWord,
    visibleChars,
    pulseOn,
    inputRef,
    handleInput,
    TURN_TIME_LIMIT,
    ROUND_TIME_LIMIT
  };
};
