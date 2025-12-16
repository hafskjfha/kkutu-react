import React, { useState } from 'react';
import { HelpCircle, Settings, Book, LogOut, Play } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import HelpModal from './HelpModal';

/**
 * 게임 상단 메뉴 컴포넌트
 * 도움말, 설정, 사전, 시작, 나가기 버튼을 포함합니다.
 */
const KkutuMenu = () => {
    const { isPlaying, requestStart, exitGame } = useGameState();

    const [helpOpen, setHelpOpen] = useState(false);

    // 버튼 클릭 핸들러
    const handleButtonClick = (buttonId: string) => {
        if (buttonId === 'start') {
            requestStart();
        } else if (buttonId === 'exit') {
            exitGame();
        } else if (buttonId === 'help') {
            setHelpOpen(true);
        }
        // 추후 기능 구현 예정 (settings, dict)
    };

    const buttonBaseClasses = "border-none rounded-t-lg h-8 transition-all duration-200 hover:scale-115 hover:shadow-lg shadow-md px-6 mt-5 origin-bottom text-gray-800 border-gray-800";
    const tinyMenuClasses = "!px-2";

    return (
        <div className="w-[1010px] h-[40px] flex items-end">
            {/* 도움말 버튼 */}
            <button
                id="HelpBtn"
                className={`${buttonBaseClasses} ${tinyMenuClasses} bg-gray-400 hover:bg-gray-500`}
                onClick={() => handleButtonClick('help')}
                aria-label="도움말"
            >
                <HelpCircle size={16} />
            </button>

            {/* 설정 버튼 */}
            <button
                id="SettingBtn"
                className={`${buttonBaseClasses} ${tinyMenuClasses} bg-gray-500 hover:bg-gray-600`}
                onClick={() => handleButtonClick('settings')}
                aria-label="설정"
            >
                <Settings size={16} />
            </button>

            {/* 사전 버튼 */}
            <button
                id="DictionaryBtn"
                className={`${buttonBaseClasses} bg-green-400 hover:bg-green-500 flex items-center justify-center gap-1 text-sm font-medium`}
                onClick={() => handleButtonClick('dict')}
            >
                <Book size={14} />
                <span>사전</span>
            </button>

            {/* 시작 버튼 (게임 시작 전에만 표시) */}
            {!isPlaying && (
                <button
                    id="StartBtn"
                    className={`${buttonBaseClasses} flex items-center justify-center gap-1 text-sm font-medium`}
                    style={{ backgroundColor: '#FFB576' }}
                    onClick={() => handleButtonClick('start')}
                >
                    <Play size={14} />
                    <span>시작</span>
                </button>
            )}

            {/* 나가기 버튼 (게임 시작 후에만 표시) */}
            {isPlaying && (
                <button
                    id="ExitBtn"
                    className={`${buttonBaseClasses} bg-red-300 hover:bg-red-400 flex items-center justify-center gap-1 text-sm font-medium`}
                    onClick={() => handleButtonClick('exit')}
                >
                    <LogOut size={14} />
                    <span>나가기</span>
                </button>
            )}
                

            {helpOpen && (
                <HelpModal onClose={() => setHelpOpen(false)} />
            )}
        </div>
    );
};

export default KkutuMenu;