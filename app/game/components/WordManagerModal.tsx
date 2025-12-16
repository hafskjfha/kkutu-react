"use client";
import React, { useState, useEffect } from 'react';
import { getAllWords, searchWordsByPrefix, updateWord, deleteWord, addWord } from '../lib/wordDB';

interface WordManagerModalProps {
  onClose: () => void;
}

/**
 * 단어 관리 모달 컴포넌트
 * ㄱㄴㄷ순 정렬, 접두사 검색, 수정, 삭제 기능 제공
 */
const WordManagerModal: React.FC<WordManagerModalProps> = ({ onClose }) => {
  const [words, setWords] = useState<Array<{ word: string; theme: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingWord, setEditingWord] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newWord, setNewWord] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    setIsLoading(true);
    const allWords = await getAllWords();
    setWords(allWords);
    setIsLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadWords();
      return;
    }
    
    const results = await searchWordsByPrefix(searchQuery.trim());
    setWords(results);
  };

  const handleEdit = (word: string) => {
    setEditingWord(word);
    setEditValue(word);
  };

  const handleSaveEdit = async (oldWord: string) => {
    if (editValue.trim() && editValue !== oldWord) {
      try {
        await updateWord(oldWord, editValue.trim());
        await loadWords();
      } catch (error) {
        alert('단어 수정 중 오류가 발생했습니다.');
      }
    }
    setEditingWord(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingWord(null);
    setEditValue('');
  };

  const handleDelete = async (word: string) => {
    if (confirm(`"${word}"를 삭제하시겠습니까?`)) {
      await deleteWord(word);
      await loadWords();
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) {
      alert('단어를 입력해주세요.');
      return;
    }

    try {
      await addWord(newWord.trim());
      setNewWord('');
      await loadWords();
    } catch (error) {
      alert('단어 추가 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-[90%] max-w-[800px] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            단어 목록 관리
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 검색 및 추가 섹션 */}
        <div className="p-6 border-b space-y-4">
          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              단어 검색 (접두사)
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="예: 끝말, 게임..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 새 단어 추가 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
              placeholder="새 단어 추가..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleAddWord}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              추가
            </button>
          </div>
        </div>

        {/* 단어 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">
              로딩 중...
            </div>
          ) : words.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchQuery ? '검색 결과가 없습니다.' : '등록된 단어가 없습니다.'}
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-4">
                총 {words.length}개의 단어
              </div>
              <div className="space-y-2">
                {words.map((item) => (
                  <div
                    key={item.word}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {editingWord === item.word ? (
                      <>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(item.word);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="flex-1 px-3 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <div className="flex gap-2 ml-3">
                          <button
                            onClick={() => handleSaveEdit(item.word)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                          >
                            저장
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
                          >
                            취소
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <span className="text-gray-800 font-medium">
                            {item.word}
                          </span>
                          <span className="ml-3 text-sm text-gray-500">
                            ({item.theme})
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item.word)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(item.word)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                          >
                            삭제
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordManagerModal;
