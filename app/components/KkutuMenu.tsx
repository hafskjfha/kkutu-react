import React, { useState } from 'react';
import { HelpCircle, Settings, Book, LogOut } from 'lucide-react';

const KkutuMenu = () => {

    // Toggle state removed; click handler is now a no-op or can be customized for future use
    const handleButtonClick = (buttonId: string) => {
        // No toggle functionality
    };

    const buttonBaseClasses = "border-none rounded-t-lg h-8 transition-all duration-200 hover:scale-115 hover:shadow-lg shadow-md px-6 mt-5 origin-bottom";
    const tinyMenuClasses = "!px-2";

    return (
        <div className="w-[1010px] h-[40px] flex items-end">
            {/* Help Button */}
            <button
                id="HelpBtn"
                className={`${buttonBaseClasses} ${tinyMenuClasses} bg-gray-400 hover:bg-gray-500`}
                onClick={() => handleButtonClick('help')}
            >
                <HelpCircle size={16} />
            </button>

            {/* Settings Button */}
            <button
                id="SettingBtn"
                className={`${buttonBaseClasses} ${tinyMenuClasses} bg-gray-500 hover:bg-gray-600`}
                onClick={() => handleButtonClick('settings')}
            >
                <Settings size={16} />
            </button>

            {/* Dictionary Button */}
            <button
                id="DictionaryBtn"
                className={`${buttonBaseClasses} bg-green-400 hover:bg-green-500 flex items-center justify-center gap-1 text-sm font-medium`}
                onClick={() => handleButtonClick('dict')}
            >
                <Book size={14} />
                <span>사전</span>
            </button>

            {/* Exit Button */}
            <button
                id="ExitBtn"
                className={`${buttonBaseClasses} bg-red-300 hover:bg-red-400 flex items-center justify-center gap-1 text-sm font-medium`}
                onClick={() => handleButtonClick('exit')}
            >
                <LogOut size={14} />
                <span>나가기</span>
            </button>
        </div>
    );
};

export default KkutuMenu;