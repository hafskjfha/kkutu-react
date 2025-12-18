import React from 'react';
import { render, screen } from '@testing-library/react';
import Game from '@/app/game/Game';
import { useGameState } from '@/app/game/hooks/useGameState';
import { soundManager } from '@/app/game/lib/SoundManager';

jest.mock('@/app/game/hooks/useGameState');
jest.mock('@/app/game/lib/SoundManager');
jest.mock('@/app/game/hooks/useChat', () => ({
    ChatProvider: ({ children }: any) => <div data-testid="chat-provider">{children}</div>
}));
jest.mock('@/app/game/components/KkutuMenu', () => () => <div data-testid="kkutu-menu">Menu</div>);
jest.mock('@/app/game/GameBox', () => ({ children }: any) => <div data-testid="game-box">{children}</div>);
jest.mock('@/app/game/GameHead', () => () => <div data-testid="game-head">Head</div>);
jest.mock('@/app/game/GameSetup', () => () => <div data-testid="game-setup">Setup</div>);
jest.mock('@/app/game/KkutuChat', () => () => <div data-testid="kkutu-chat">Chat</div>);

describe('Game', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render setup when not playing', () => {
        (useGameState as unknown as jest.Mock).mockReturnValue({ isPlaying: false });
        render(<Game />);
        
        expect(soundManager.load).toHaveBeenCalled();
        expect(screen.getByTestId('kkutu-menu')).toBeInTheDocument();
        expect(screen.getByTestId('game-setup')).toBeInTheDocument();
        expect(screen.getByTestId('kkutu-chat')).toBeInTheDocument();
        expect(screen.queryByTestId('game-box')).not.toBeInTheDocument();
    });

    it('should render game box when playing', () => {
        (useGameState as unknown as jest.Mock).mockReturnValue({ isPlaying: true });
        render(<Game />);
        
        expect(screen.getByTestId('game-box')).toBeInTheDocument();
        expect(screen.getByTestId('game-head')).toBeInTheDocument();
        expect(screen.queryByTestId('game-setup')).not.toBeInTheDocument();
    });
});
