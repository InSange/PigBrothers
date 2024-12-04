'use client';

import generateUUID from '@/app/(root)/_related/generateUUID';
import { GlobalContext } from '@/app/GlobalContext';
import { useRouter } from 'next/navigation';
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
  handleCreateRoom: ({
    roomName,
    handleCloseModal,
  }: {
    roomName: string;
    handleCloseModal: () => void;
  }) => void;
  handleJoinRoom: () => void;
  handleLeaveRoom: () => void;
};

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: () => {},
  handleCreateRoom: () => {},
  handleJoinRoom: () => {},
  handleLeaveRoom: () => {},
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { userId } = useContext(GlobalContext);
  const router = useRouter();

  const handleCreateRoom: ChatContextType['handleCreateRoom'] = async ({
    roomName,
    handleCloseModal,
  }) => {
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
      setMessages([]);
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
        console.log(message);
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

  const handleJoinRoom = async () => {
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }

    const roomId = generateUUID();

    try {
      setMessages([]);
      // WebSocket 설정
      const ws = createWebSocket(
        // `ws://localhost:8000/ws/join/${roomId}/${userId}`
        `wss://wam-coin.store/ws/join/${roomId}/${userId}`
      );

      setSocket(ws);

      ws.onopen = () => {
        console.log('WebSocket connection established');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket closed. Attempting to reconnect...');
        // setTimeout(handleJoinRoom, 1000); // 1초 후 재연결 시도
      };

      ws.onmessage = (event) => {
        const message: Message = JSON.parse(event.data);
        console.log(message);
        setMessages((prev) => [...prev, message]);
      };

      router.push(`/room/${roomId}`);
    } catch (error) {
      enqueueSnackbar({
        variant: 'error',
        message: '방 생성 중 오류가 발생했습니다.',
      });
    }
  };

  const handleLeaveRoom = async () => {
    setMessages([]);
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }

    const roomId = generateUUID();

    try {
      // WebSocket 설정
      const ws = createWebSocket(
        // `ws://localhost:8000/ws/leave/${roomId}/${userId}`
        `wss://wam-coin.store/ws/leave/${roomId}/${userId}`
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
        console.log(message);
        setMessages((prev) => [...prev, message]);
      };

      router.push(`/room/${roomId}`);
    } catch (error) {
      enqueueSnackbar({
        variant: 'error',
        message: '방 생성 중 오류가 발생했습니다.',
      });
    }
  };

  const sendMessage = ({ sender, text, type = 'chat' }: Message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ sender, text, type }));
    }
  };

  const value = useMemo(
    () => ({
      messages,
      sendMessage,
      handleCreateRoom,
      handleLeaveRoom,
      handleJoinRoom,
    }),
    [messages, socket]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
