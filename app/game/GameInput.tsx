import React from 'react';

interface GameInputProps {
  placeholder?: string;
  readonly?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

const GameInput: React.FC<GameInputProps> = ({
  placeholder = "Your turn - Input chat",
  readonly = false,
  value,
  onChange,
  onKeyDown,
  className = ""
}) => {
  return (
    <div className={`
      relative 
      mt-2
      w-[460px]
      p-[5px] 
      rounded-[10px] 
      bg-white
      border-4
      border-black
      ${className}
    `}>
      <input
        id="game-input"
        type="text"
        placeholder={placeholder}
        readOnly={readonly}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="
          w-[420px] 
          h-[40px] 
          text-xl 
          bg-transparent 
          border-none 
          outline-none 
          text-black 
          placeholder-gray-400
          px-2
        "
      />
    </div>
  );
};

export default GameInput;