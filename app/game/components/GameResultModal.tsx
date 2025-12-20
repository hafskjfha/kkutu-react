"use client";
import React, { useState } from 'react';
import { Minimize2, Maximize2, X } from 'lucide-react';

interface GameResultModalProps {
  usedWords: {char: string, word: string, missionChar: string | null, useHintCount: number, isFailed?: boolean}[];
  onClose: () => void;
}

/**
 * 게임 결과 다이얼로그 컴포넌트 (비모달)
 * 게임 종료 후 사용한 단어 목록을 표시합니다.
 */
const GameResultModal: React.FC<GameResultModalProps> = ({ usedWords, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="w-96 bg-white rounded-lg shadow-2xl border-2 border-blue-500 flex flex-col animate-slide-in-right">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
        <h2 className="text-lg font-bold">🎮 게임 결과</h2>
        <div className="flex gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-white/20 rounded p-1 transition-colors"
            title={isMinimized ? "펼치기" : "최소화"}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded p-1 transition-colors"
            title="닫기"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 내용 */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4 max-h-[70vh]">
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-700">
              총 <span className="text-blue-600 text-lg">{usedWords.length}</span>개의 단어를 사용했습니다!
            </p>
          </div>

          {usedWords.length === 0 ? (
            <p className="text-gray-500 text-center py-6 text-sm">사용한 단어가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {usedWords.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-md p-3 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-gray-400 min-w-[24px] mt-0.5">
                      #{index+1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold text-blue-600">{item.char}</span>
                        <span className="text-gray-400 text-xs">→</span>
                        <span className={`text-base font-semibold ${item?.isFailed ? "text-red-600" : "text-gray-800"}`}>{item.word}</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {item.missionChar && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                            미션: {item.missionChar}
                          </span>
                        )}
                        {item.useHintCount > 0 && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                            힌트 {item.useHintCount}회
                          </span>
                        )}
                        {item?.isFailed && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                            입력 실패
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 최소화 상태일 때 요약 정보 */}
      {isMinimized && (
        <div className="px-4 py-3 text-sm text-gray-700 border-t border-gray-200">
          총 {usedWords.length}개의 단어 사용
        </div>
      )}
    </div>
  );
};

export default GameResultModal;
