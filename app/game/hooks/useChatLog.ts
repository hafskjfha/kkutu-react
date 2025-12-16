import { useState, useEffect, useRef } from 'react';
import { useChat } from './useChat';
import { useGameState } from './useGameState';
import gameManager from '../lib/gameManager';

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
  const { callGameInput, registerSendHint } = useChat();
  const { requestStart } = useGameState();
  const chatRef = useRef<HTMLDivElement>(null);

  /**
   * 메시지 전송 핸들러
   */
  const handleSendMessage = () => {
    if (chatInput.trim()) {
      const trimmedInput = chatInput.trim();
      
      // 게임 시작 명령어 체크
      if (trimmedInput === '/시작' || trimmedInput === '/ㄱ' || trimmedInput === '/r') {
        const noticeMessage: ChatMessage = {
          id: messages.length + 1,
          username: '알림',
          message: '게임을 시작합니다!',
          timestamp: new Date().toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isNotice: true
        };
        setMessages([...messages, noticeMessage]);
        setChatInput('');
        requestStart();
        return;
      }

      // 게임 종료 명령어 (채팅에서 바로 종료 요청)
      if (trimmedInput === '/gg' || trimmedInput === '/ㅈㅈ') {
        // forward to registered game handler if any
        try {
          callGameInput(trimmedInput);
        } catch (e) {}
        setChatInput('');
        const noticeMessage: ChatMessage = {
          id: messages.length + 1,
          username: '알림',
          message: '게임을 종료합니다.',
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          isNotice: true
        };
        setMessages(prev => [...prev, noticeMessage]);
        return;
      }

      // 힌트 명령어 (/ㅍ 또는 /v)
      if (trimmedInput === '/ㅍ' || trimmedInput === '/v') {
        const hint = gameManager.getHintWord();
        if (hint === null) {
          return setChatInput('');
        }
        const hintMsg: ChatMessage = {
          id: messages.length + 1,
          username: '힌트',
          message: hint ? `힌트: ${hint}` : '힌트가 없습니다.',
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          isNotice: false
        };
        setMessages([...messages, hintMsg]);
        setChatInput('');
        return;
      }
      
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

  // register our hint sender so other UI (GameHead) can trigger it
  useEffect(() => {
    registerSendHint(() => {
      const hint = gameManager.getHintWord();
      if (hint === null) return setChatInput('');
      const hintMsg: ChatMessage = {
        id: Date.now(),
        username: '힌트',
        message: hint ? `힌트: ${hint}` : '힌트가 없습니다.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isNotice: false
      };
      setMessages(prev => [...prev, hintMsg]);
      setChatInput('');
    });
    return () => registerSendHint(null);
  }, [registerSendHint]);

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
    handleKeyPress,
    // expose hint sender for callers that bypass chat send (e.g. when game input is focused)
    sendHint: () => {
      const hint = gameManager.getHintWord();
      if (hint === null) return setChatInput('');
      const hintMsg: ChatMessage = {
        id: messages.length + 1,
        username: '힌트',
        message: hint ? `힌트: ${hint}` : '힌트가 없습니다.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isNotice: false
      };
      setMessages(prev => [...prev, hintMsg]);
      setChatInput('');
    }
  };
};
