import { useGameState } from '@/app/game/hooks/useGameState';
import gameManager from '@/app/game/lib/GameManager';

jest.mock('@/app/game/lib/GameManager', () => ({
    __esModule: true,
    default: {
        canGameStart: jest.fn(),
    },
}));

describe('useGameState', () => {
    beforeEach(() => {
        useGameState.setState({
            isPlaying: false,
            pendingStart: false,
            startBlocked: false,
            startBlockedMessage: null,
        });
        jest.clearAllMocks();
    });

    it('should have initial state', () => {
        const state = useGameState.getState();
        expect(state.isPlaying).toBe(false);
        expect(state.pendingStart).toBe(false);
        expect(state.startBlocked).toBe(false);
        expect(state.startBlockedMessage).toBeNull();
    });

    it('should request start successfully', () => {
        (gameManager.canGameStart as jest.Mock).mockReturnValue(true);
        
        useGameState.getState().requestStart();
        
        const state = useGameState.getState();
        expect(state.isPlaying).toBe(true);
        expect(state.pendingStart).toBe(true);
        expect(state.startBlocked).toBe(false);
    });

    it('should block start if gameManager says no', () => {
        (gameManager.canGameStart as jest.Mock).mockReturnValue(false);
        
        useGameState.getState().requestStart();
        
        const state = useGameState.getState();
        expect(state.isPlaying).toBe(false);
        expect(state.pendingStart).toBe(false);
        expect(state.startBlocked).toBe(true);
        expect(state.startBlockedMessage).toBe('게임을 시작할 수 없습니다.');
    });

    it('should clear pending start', () => {
        useGameState.setState({ pendingStart: true });
        useGameState.getState().clearPendingStart();
        expect(useGameState.getState().pendingStart).toBe(false);
    });

    it('should exit game', () => {
        useGameState.setState({ isPlaying: true, pendingStart: true });
        useGameState.getState().exitGame();
        const state = useGameState.getState();
        expect(state.isPlaying).toBe(false);
        expect(state.pendingStart).toBe(false);
    });

    it('should dismiss start blocked', () => {
        useGameState.setState({ startBlocked: true, startBlockedMessage: 'Error' });
        useGameState.getState().dismissStartBlocked();
        const state = useGameState.getState();
        expect(state.startBlocked).toBe(false);
        expect(state.startBlockedMessage).toBeNull();
    });
});
