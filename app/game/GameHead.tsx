import React from 'react';

interface GraphBarProps {
  className: string;
  min?: number;
  val?: number;
  max?: number;
  bgc?: string;
}

const GraphBar: React.FC<GraphBarProps> = ({ className, min = 0, val = 0, max = 100, bgc }) => {
  const percentage = ((val - min) / (max - min)) * 100;
  
  return (
    <div className={`graph ${className}`}>
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
    <div className="game-head flex items-start">
      {/* Items Section */}
      <div className="items pt-[50px] mt-[50px] mx-[40px] ml-[105px] w-[100px] h-[110px] text-[24px] text-[#EEEEEE] font-bold text-center shadow-text bg-[url('/img/lefthand.png')] bg-no-repeat">
        가
      </div>

      {/* Jjoriping Section */}
      <div className="jjoriping w-[500px]">
        {/* Jjo Objects */}
        <div className="relative">
          <img 
            className="jjoObj jjoEyeL top-[11px] left-[0px]" 
            src="/img/jjoeyeL.png" 
            alt="Left Eye"
          />
          <img 
            className="jjoObj jjoNose top-[9px] left-[181px]" 
            src="/img/jjonose.png" 
            alt="Nose"
          />
          <img 
            className="jjoObj jjoEyeR top-[11px] left-[361px]" 
            src="/img/jjoeyeR.png" 
            alt="Right Eye"
          />
        </div>

        {/* Display Bar */}
        <div className="jjoDisplayBar p-[20px_5px_5px_5px] border-2 border-black rounded-bl-[10px] rounded-br-[10px] -mt-[10px] w-[486px] h-[80px] bg-[#DEAF56]">
          {/* Main Display */}
          <div className="jjo-display ellipse p-[8px_5px] rounded-[10px] rounded-bl-none rounded-br-none w-[476px] h-[23px] text-[20px] text-center text-[#EEEEEE] bg-black/70">
            테스트
          </div>

          {/* Graph Bars */}
          <div className="jjo-turn-time border-l border-r border-black/70 w-[484px] h-[20px] text-white text-right overflow-hidden bg-[#70712D]">
            <div className="graph-bar pt-[4px] h-[16px] text-[11px] whitespace-nowrap overflow-hidden bg-[#E6E846]" style={{ width: '30%' }}>
              7.2초
            </div>
          </div>

          <div className="jjo-round-time border-l border-r border-b border-black/70 rounded-bl-[10px] rounded-br-[10px] w-[484px] h-[20px] text-white text-right overflow-hidden bg-[#223C6C]">
            <div className="graph-bar pt-[4px] h-[16px] text-[11px] whitespace-nowrap overflow-hidden bg-[#3573E4]" style={{ width: '50%' }}>
              100.9초
            </div>
          </div>
        </div>
      </div>

      {/* Chain Section */}
      <div className="chain pt-[50px] mt-[50px] mx-[105px] mr-[40px] w-[100px] h-[110px] text-[24px] text-[#EEEEEE] font-bold text-center shadow-text bg-[url('/img/righthand.png')] bg-no-repeat">
        0
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .shadow-text {
          text-shadow: 0px 1px 5px #141414;
        }

        .jjoObj{ position: relative; }
        
        .ellipse{
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .graph {
          box-shadow: none;
          text-shadow: 0px 1px 3px #141414;
        }
        
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
        
        .game-fail-text {
          animation: FailBlink 2s linear;
          color: #FF7777;
        }
        
        @keyframes FailBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
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
        
        /* CW and PQ specific styles */
        
        .cw.jjoriping, .pq.jjoriping {
          margin-top: -10px;
          width: 322px;
        }
        
        .cw .jjoDisplayBar, .pq .jjoDisplayBar {
          width: 308px;
          height: 330px;
          transition: all 0.5s ease;
        }
        
        .cw .jjo-display, .pq .jjo-display {
          position: relative;
          padding: 5px;
          width: 298px;
          height: 298px;
        }
        
        .cw .jjo-turn-time, .pq .jjo-turn-time {
          display: none;
        }
        
        .cw .jjo-round-time, .pq .jjo-round-time {
          width: 306px;
        }
        
        /* CW Bar styles */
        .cw-bar {
          position: absolute;
          border-radius: 10px;
          cursor: pointer;
          background-color: #C7C7C7;
        }
        
        .cw-bar:hover {
          background-color: #F2F2F2;
          z-index: 1;
        }
        
        .cw-bar.cw-open {
          background-color: #777777;
          pointer-events: none;
          z-index: 2;
        }
        
        .cw-bar.cw-my-open {
          background-color: #00A55A;
        }
        
        .cw-cell {
          padding-top: 4px;
          border-radius: 5px;
          margin: 3px;
          width: 32.5px;
          height: 28.5px;
          box-shadow: 0px 1px 1px #000000;
        }
      `}</style>
    </div>
  );
};

export default GameHead;