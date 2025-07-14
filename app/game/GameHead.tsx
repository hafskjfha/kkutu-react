import React from 'react';
import HistoryHolder from './HistoryHolder';

interface GraphBarProps {
  className: string;
  min?: number;
  val?: number;
  max?: number;
  bgc?: string;
}

const GraphBar = ({ className, min = 0, val = 0, max = 100, bgc }: GraphBarProps) => {
  const percentage = ((val - min) / (max - min)) * 100;
  
  return (
    <div className={`shadow-none ${className}`} style={{ textShadow: '0px 1px 3px #141414' }}>
      <div 
        className="graph-bar"
        style={{ 
          width: `${percentage}%`,
          backgroundColor: bgc || undefined
        }}
      />
    </div>
  );
};

const GameHead: React.FC = () => {
  return (
    <>
      <div className="game-head flex items-start">
        {/* Items Section */}
        <div 
          className="items pt-[50px] mt-[50px] mx-[40px] ml-[105px] w-[100px] h-[110px] text-[24px] text-[#EEEEEE] font-bold text-center bg-[url('/img/lefthand.png')] bg-no-repeat"
          style={{ textShadow: '0px 1px 5px #141414' }}
        >
          가
        </div>

        {/* Jjoriping Section */}
        <div className="jjoriping w-[500px]">
          {/* Jjo Objects */}
          <div className="relative">
            <img 
              className="absolute top-[11px] left-[32px]" 
              src="/img/jjoeyeL.png" 
              alt="Left Eye"
            />
            <img 
              className="absolute top-[48px] left-[264px]" 
              src="/img/jjonose.png" 
              alt="Nose"
            />
            <img 
              className="absolute top-[11px] left-[460px]" 
              src="/img/jjoeyeR.png" 
              alt="Right Eye"
            />
          </div>

          {/* Display Bar */}
          <div className="p-[20px_5px_5px_5px] border-2 border-black rounded-bl-[10px] rounded-br-[10px] mt-[40px] w-[486px] h-[120px] bg-[#DEAF56] ml-8">
            {/* Main Display */}
            <div className="p-[8px_5px] rounded-[10px] rounded-bl-none rounded-br-none w-[474px] h-[40px] text-[20px] text-center text-[#EEEEEE] bg-black/70 whitespace-nowrap overflow-hidden text-ellipsis">
              테스트
            </div>

            {/* Graph Bars */}
            <div className="border-l border-r border-black/70 w-[474px] h-[20px] text-white text-right overflow-hidden bg-[#70712D]">
              <div className="pt-[4px] h-[20px] text-[11px] whitespace-nowrap overflow-hidden bg-[#E6E846]" style={{ width: '30%' }}>
                7.2초
              </div>
            </div>

            <div className="border-l border-r border-b border-black/70 rounded-bl-[10px] rounded-br-[10px] w-[474px] h-[20px] text-white text-right overflow-hidden bg-[#223C6C]">
              <div className="pt-[4px] h-[20px] text-[11px] whitespace-nowrap overflow-hidden bg-[#3573E4]" style={{ width: '50%' }}>
                100.9초
              </div>
            </div>
          </div>
        </div>

        {/* Chain Section */}
        <div 
          className="chain pt-[50px] mt-[50px] mx-[105px] mr-[40px] w-[100px] h-[110px] text-[24px] text-[#EEEEEE] font-bold text-center bg-[url('/img/righthand.png')] bg-no-repeat"
          style={{ textShadow: '0px 1px 5px #141414' }}
        >
          0
        </div>

        {/* Custom Styles that can't be converted to Tailwind */}
        <style jsx>{`
          /* Animation for game fail text */
          @keyframes FailBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          
          .game-fail-text {
            animation: FailBlink 2s linear;
            color: #FF7777;
          }
          
          
          /* Utility classes */
          .round-extreme {
            background-color: #FF6D6D !important;
          }
          
          .sock-char {
            text-align: center;
          }
          
          .sock-picked {
            color: #FFFF44;
            font-weight: bold;
            font-size: 24px;
          }
          
          .display-text {
            width: 20px;
            text-align: center;
            z-index: 1;
          }
          
          .jjo-display-word-length {
            color: orange;
            font-size: 14px;
          }
        `}</style>
      </div>

      {/* History Holder - Items 섹션과 같은 위치에서 시작 */}
      <div className="ml-[105px]">
        <HistoryHolder />
      </div>
    </>
  );
};

export default GameHead;