"use client";
import KkutuMenu from "../components/KkutuMenu";
import GameBox from "./GameBox";
import GameHead from "./GameHead";

const Game = () => {
    return (
        <div>
            <KkutuMenu />
            <GameBox>
                <GameHead />
            </GameBox>
        </div>
    );
};

export default Game;