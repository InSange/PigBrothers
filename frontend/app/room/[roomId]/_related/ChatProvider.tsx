'use client';

import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import createWebSocket from './websocket';

export type Message = {
  sender: string;
  text: string;
  type: 'lobby' | 'inGame';
};

type ChatContextType = {
  messages: Message[];
  sendMessage: ({}: Message) => void;
};

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: () => {},
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = createWebSocket('ws://localhost:8000/ws/chat');
    // const ws = createWebSocket('ws://13.125.139.238:8000/ws/chat');
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

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = ({ sender, text }: Message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ sender, text }));
    }
  };

  const value = useMemo(() => ({ messages, sendMessage }), [messages, socket]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
