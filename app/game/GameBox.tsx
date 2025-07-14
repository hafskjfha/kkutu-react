import React from 'react';

const GameBox = ({children}:{children: React.ReactNode}) => {
  return (
    <div 
      className="w-[1000px] h-[410px] bg-[url('/img/gamebg.png')]"
    >
      {children}
    </div>
  );
};

export default GameBox;