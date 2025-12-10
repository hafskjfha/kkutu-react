import { useState, useEffect, useRef } from 'react';
import { useChat } from './useChat';

export interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  isNotice?: boolean;
}

/**
 * 채팅 메시지 목록 및 전송 로직을 관리하는 커스텀 훅
 */
export const useChatLog = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      username: '알림',
      message: '게임방에 입장하셨습니다.',
      timestamp: new Date().toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      isNotice: true
    },
  ]);

  const { chatInput, setChatInput } = useChat();
  const chatRef = useRef<HTMLDivElement>(null);

  /**
   * 메시지 전송 핸들러
   */
  const handleSendMessage = () => {
    if (chatInput.trim()) {
      const newMessage: ChatMessage = {
        id: messages.length + 1,
        username: '나',
        message: chatInput,
        timestamp: new Date().toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      
      setMessages([...messages, newMessage]);
      setChatInput('');
    }
  };

  /**
   * 키 입력 핸들러 (Enter 키 입력 시 전송)
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // 메시지가 추가될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return {
    messages,
    chatRef,
    handleSendMessage,
    handleKeyPress
  };
};
