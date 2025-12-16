"use client";
import React from 'react';

interface Props { onClose: () => void }

const HelpModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-[90%] max-w-[600px] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">사용 방법</h3>
          <button onClick={onClose} className="text-gray-600 text-xl">×</button>
        </div>
        <div className="text-sm text-gray-700 space-y-2">
          <p>1. txt 파일로 단어 목록을 업로드하세요 (한 줄에 하나씩).</p>
          <p>2. 단어는 자동으로 IndexedDB에 저장되어 다음 방문 시에도 유지됩니다.</p>
          <p>3. 단어 목록 조회 버튼으로 등록된 단어를 관리할 수 있습니다.</p>
          <p>4. 준비가 완료되면 시작 버튼을 눌러 게임을 시작하세요. 또는 채팅창에 <strong>/시작</strong>, <strong>/ㄱ</strong>, <strong>/r</strong>을 입력하세요.</p>
        </div>
        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded">닫기</button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
