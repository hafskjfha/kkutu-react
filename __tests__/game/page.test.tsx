import React from 'react';
import { render, screen } from '@testing-library/react';
import Page from '@/app/game/page';

jest.mock('@/app/game/Game', () => () => <div data-testid="game-component">Game</div>);

describe('Game Page', () => {
    it('should render Game component', () => {
        render(<Page />);
        expect(screen.getByTestId('game-component')).toBeInTheDocument();
    });
});
