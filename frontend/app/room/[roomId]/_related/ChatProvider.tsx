'use client';

import { GlobalContext } from '@/app/GlobalContext';
import { MANAGER } from '@/constant';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ff7394b6-be9e-437d-ba4e-b632c81df073',
      text: '123',
      type: 'chat',
    },
    { sender: '123', text: '밤이 되었습니다.', type: 'chat' },
    {
      sender: 'ff7394b6-be9e-437d-ba4e-b632c81df073',
      text: '123',
      type: 'chat',
    },
    { sender: '123', text: '123', type: 'chat' },
    { sender: MANAGER, text: '밤이 되었습니다.', type: 'chat' },
    { sender: MANAGER, text: '123', type: 'chat' },
  ]);
  const socketRef = useRef<WebSocket | null>(null);
  const { userId } = useContext(GlobalContext);
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!roomId || !userId || socketRef.current) return;

    const ws = createWebSocket(
      `wss://wam-coin.store/ws/room/${roomId}/${userId}`
    );
    socketRef.current = ws;

    ws.onopen = () => console.log('WebSocket connection established');
    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      socketRef.current = null;
    };
    ws.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [roomId, userId]);

  const handleLeaveRoom = async () => {
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }

    try {
      setMessages([]);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'leave' }));
      }
      router.push('/home');
    } catch (error) {
      enqueueSnackbar({
        variant: 'error',
        message: '방 나가기 중 오류가 발생했습니다.',
      });
    }
  };

  const sendMessage = ({ sender, text, type = 'chat' }: Message) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      enqueueSnackbar({
        variant: 'error',
        message: 'WebSocket 연결이 없습니다. 메시지를 보낼 수 없습니다.',
      });
      return;
    }

    socketRef.current.send(JSON.stringify({ sender, text, type }));
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
