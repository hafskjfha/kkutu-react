import { create } from 'zustand';

interface GameState {
  isPlaying: boolean;
  pendingStart: boolean; // 게임 화면으로 전환 후 자동 시작 대기 플래그
  requestStart: () => void; // 준비 화면(or chat)에서 시작 요청
  clearPendingStart: () => void;
  exitGame: () => void;
}

/**
 * 게임 상태를 관리하는 Zustand store
 * isPlaying: 게임 화면 렌더 여부
 * pendingStart: GameHead가 준비되면 자동으로 시작할지 여부
 */
export const useGameState = create<GameState>((set) => ({
  isPlaying: false,
  pendingStart: false,
  requestStart: () => set({ isPlaying: true, pendingStart: true }),
  clearPendingStart: () => set({ pendingStart: false }),
  exitGame: () => set({ isPlaying: false, pendingStart: false }),
}));
