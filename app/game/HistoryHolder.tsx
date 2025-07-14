import React from 'react';

interface HistoryItemProps {
  theme?: string[];
  className?: string;
  word: string;
  meaning?: string;
  wordType?: 'm1' | 'm2' | 'm3';
  wordTheme?: string;
}

const HistoryItem = ({
  theme,
  className,
  word,
  meaning,
  wordType,
  wordTheme
}: HistoryItemProps) => {
  const getWordHeadStyle = () => {
    switch (wordType) {
      case 'm1':
        return 'px-0.5 mx-0.5 text-black font-bold bg-gray-300';
      case 'm2':
        return 'text-green-400';
      case 'm3':
        return 'text-gray-200 before:content-["("] after:content-[")"]';
      default:
        return '';
    }
  };

  return (
    <div className="h-10 w-[170px] px-3 py-1 rounded-lg m-1 text-gray-200 text-center bg-gray-800 flex flex-col justify-center items-center overflow-hidden">
      {/* 첫 번째 줄: 단어 + 품사 */}
      <div className="flex items-center w-full overflow-hidden justify-center">
        <span className={`mr-1 ${getWordHeadStyle()} truncate max-w-[230px] text-center text-[14px]`}>
          {word}
        </span>
        {className && (
          <span className="rounded ml-1 text-[10px] text-black bg-blue-400 truncate max-w-[32px]">
            {className}
          </span>
        )}
      </div>
      
      {/* 두 번째 줄: 주제 + 뜻 */}
      <div className="flex items-center text-xs">
        {theme && theme.length > 0 && (
          theme.map((t,index)=>(
          <span key={index} className="mx-1 text-sky-300">
            &lt;{t}&gt; {index < theme.length - 1 ? ',' : ''}
          </span>
          ))
        )}
        
        {wordTheme && (
          <span className="text-sky-300 before:content-['<'] after:content-['>']">
            {wordTheme}
          </span>
        )}
        
        {meaning && (
          <span className="px-0.5 pt-0.5 pb-0 pl-0.5 text-gray-400">
            {meaning}
          </span>
        )}
      </div>
    </div>
  );
};

const HistoryHolder: React.FC = () => {
  // 예시 데이터
  const historyItems = [
    {
      theme: ["일반", "과일"],
      word: "사과",
    },
    {
        theme: ["컴퓨터"],
        word: "대용량기억장치시스템"
    },
    {
        theme: ["화학"],
        word: "니코틴아마이드아데닌다이뉴클레오타이드"
    }
  ];

  return (
    <div className="w-[990px] h-10 overflow-hidden">
      <div className="w-[1200px] h-[42px] flex items-center">
        {historyItems.map((item, index) => (
          <HistoryItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default HistoryHolder;