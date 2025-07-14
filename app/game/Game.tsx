"use client";
import KkutuChat from "../components/KkutuChat";
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
            <KkutuChat />
        </div>
    );
};

export default Game;