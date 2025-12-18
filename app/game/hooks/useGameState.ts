import { create } from 'zustand';
import gameManager from '../lib/GameManager';

interface GameState {
  isPlaying: boolean;
  pendingStart: boolean; // 게임 화면으로 전환 후 자동 시작 대기 플래그
  startBlocked: boolean; // 게임 시작 불가 모달 표시
  startBlockedMessage: string | null;
  requestStart: () => void; // 준비 화면(or chat)에서 시작 요청
  clearPendingStart: () => void;
  exitGame: () => void;
  dismissStartBlocked: () => void;
}

/**
 * 게임 상태를 관리하는 Zustand store
 * isPlaying: 게임 화면 렌더 여부
 * pendingStart: GameHead가 준비되면 자동으로 시작할지 여부
 */
export const useGameState = create<GameState>((set) => ({
  isPlaying: false,
  pendingStart: false,
  startBlocked: false,
  startBlockedMessage: null,
  requestStart: () => {
    // check with gameManager whether a game can be started
    try {
      if (gameManager.canGameStart()) {
        set({ isPlaying: true, pendingStart: true });
      } else {
        set({ startBlocked: true, startBlockedMessage: '게임을 시작할 수 없습니다.' });
      }
    } catch (e) {
      set({ startBlocked: true, startBlockedMessage: '게임을 시작할 수 없습니다.' });
    }
  },
  clearPendingStart: () => set({ pendingStart: false }),
  exitGame: () => set({ isPlaying: false, pendingStart: false }),
  dismissStartBlocked: () => set({ startBlocked: false, startBlockedMessage: null }),
}));
