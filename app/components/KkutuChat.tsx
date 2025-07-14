import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  isNotice?: boolean;
}

const KkutuChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      username: '알림',
      message: '게임방에 입장하셨습니다.',
      timestamp: '12:00',
      isNotice: true
    },
    {
      id: 2,
      username: '사용자1',
      message: '안녕하세요!',
      timestamp: '12:01'
    },
    {
      id: 3,
      username: '사용자2',
      message: '반갑습니다. 좋은 하루 되세요!',
      timestamp: '12:02'
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: ChatMessage = {
        id: messages.length + 1,
        username: '나',
        message: inputMessage,
        timestamp: new Date().toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      
      setMessages([...messages, newMessage]);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full max-w-[1000px] -mt-8 bg-white border border-gray-300 rounded-lg overflow-hidden">
      {/* Chat Header */}
      <div className="flex bg-gray-100 px-4 py-2 border-b border-gray-300">
        <MessageCircle size={20} className="mr-2 text-gray-600" fill={"gray-100"} />
        <h3 className="font-semibold text-gray-800">채팅</h3>
      </div>

      {/* Chat Messages Area */}
      <div 
        ref={chatRef}
        className="h-32 overflow-y-auto p-2 bg-gray-50"
        id="Chat"
      >
        {messages.map((message, index) => (
          <div key={message.id}>
            {index > 0 && (
              <hr className="border-0 border-b border-dashed border-gray-400 my-1" />
            )}
            <div className={`chat-item w-full overflow-hidden p-1 my-1 ${
              message.isNotice ? 'bg-gray-300' : ''
            }`}>
              <div className="flex items-start gap-2">
                {/* Timestamp */}
                <div className="chat-stamp w-16 text-xs text-gray-500 text-right pt-1 flex-shrink-0">
                  {message.timestamp}
                </div>
                
                {/* Username */}
                <div className={`chat-head w-24 font-bold text-center cursor-pointer hover:bg-white px-2 py-1 rounded flex-shrink-0 ${
                  message.isNotice ? 'text-blue-600' : 'text-gray-800'
                }`}>
                  {message.username}
                </div>
                
                {/* Message Body */}
                <div className="chat-body flex-1 min-h-4 py-1 text-gray-800">
                  {message.message}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex border-t border-gray-300">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          maxLength={200}
          placeholder="메시지를 입력하세요..."
          className="flex-1 px-4 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-none text-gray-800"
          id="TalkX"
        />
        <button
          onClick={handleSendMessage}
          className="w-16 bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center transition-colors"
          id="ChatBtn"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default KkutuChat;