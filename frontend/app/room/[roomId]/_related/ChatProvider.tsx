'use client';

import { GlobalContext } from '@/app/GlobalContext';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import createWebSocket from './websocket';

export type Message = {
  sender: string;
  text: string;
  type: 'chat' | 'start_game' | 'end_game';
};

type ChatContextType = {
  messages: Message[];
  sendMessage: ({}: Message) => void;
  handleLeaveRoom: () => void;
};

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: () => {},
  handleLeaveRoom: () => {},
});

import { useEffect, useRef } from 'react';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const { userId } = useContext(GlobalContext);
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!socketRef.current) {
      // WebSocket 초기화
      const ws = createWebSocket(
        // `wss://wam-coin.store/ws/room/${roomId}/${userId}`
        `ws://localhost:8000/ws/room/${roomId}/${userId}`
      );
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection established');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        socketRef.current = null; // 연결이 닫히면 null로 설정
      };

      ws.onmessage = (event) => {
        const message: Message = JSON.parse(event.data);
        console.log(message);
        setMessages((prev) => [...prev, message]);
      };
    }

    return () => {
      // 컴포넌트 언마운트 시 WebSocket 닫기
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  const handleLeaveRoom = async () => {
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }

    try {
      setMessages([]);
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(JSON.stringify({ type: 'leave' }));
        router.push('/home');
      }
    } catch (error) {
      enqueueSnackbar({
        variant: 'error',
        message: '방 나가기 중 오류가 발생했습니다.',
      });
    }
  };

  const sendMessage = ({ sender, text, type = 'chat' }: Message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ sender, text, type }));
    }
  };

  const value = useMemo(
    () => ({
      messages,
      sendMessage,
      handleLeaveRoom,
    }),
    [messages]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
