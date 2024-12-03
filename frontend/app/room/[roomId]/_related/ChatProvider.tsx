'use client';

import generateUUID from '@/app/(root)/_related/generateUUID';
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
  handleConfirmAction: ({
    roomName,
    handleCloseModal,
  }: {
    roomName: string;
    handleCloseModal: () => void;
  }) => void;
};

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: () => {},
  handleConfirmAction: () => {},
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { userId } = useContext(GlobalContext);
  const router = useRouter();

  const handleConfirmAction = async ({
    roomName,
    handleCloseModal,
  }: {
    roomName: string;
    handleCloseModal: () => void;
  }) => {
    console.log('들어옴');
    console.log({ roomName, userId });
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }

    if (!roomName) {
      enqueueSnackbar({ variant: 'error', message: '방 제목을 입력해주세요.' });
      return;
    }

    const roomId = generateUUID();

    try {
      // WebSocket 설정
      const ws = createWebSocket(
        // `ws://localhost:8000/ws/create/${roomId}/${userId}/${roomName}`
        `wss://wam-coin.store/ws/create/${roomId}/${userId}/${roomName}`
      );

      setSocket(ws);

      ws.onopen = () => {
        console.log('WebSocket connection established');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      ws.onmessage = (event) => {
        const message: Message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
      };

      router.push(`/room/${roomId}`);
      handleCloseModal();
    } catch (error) {
      enqueueSnackbar({
        variant: 'error',
        message: '방 생성 중 오류가 발생했습니다.',
      });
    }
  };

  const sendMessage = ({ sender, text }: Message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ sender, text }));
    }
  };

  const value = useMemo(
    () => ({ messages, sendMessage, handleConfirmAction }),
    [messages, socket]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
