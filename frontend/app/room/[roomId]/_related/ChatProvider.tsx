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

export type MessageType = 'chat' | 'start_game' | 'end_game';

export interface Message {
  sender: string;
  text: string;
  type: MessageType;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (message: Message) => void;
  handleLeaveRoom: () => Promise<void>;
}

const INITIAL_MESSAGES: Message[] = [
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
];

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: () => {},
  handleLeaveRoom: async () => {},
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const { userId } = useContext(GlobalContext);
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!roomId || !userId || isConnecting || wsRef.current) return;

    const connectWebSocket = () => {
      setIsConnecting(true);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        setIsConnecting(false);
        return;
      }

      wsRef.current = new WebSocket(
        `wss://wam-coin.store/ws/room/${roomId}/${userId}`
      );

      wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnecting(false);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        wsRef.current = null;
        setIsConnecting(false);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data);
          setMessages((prev) => [...prev, message]);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnecting(false);
    };
  }, [roomId, userId, isConnecting]);

  const handleLeaveRoom = async () => {
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }

    try {
      if (wsRef.current) {
        wsRef.current.close();
      }
      router.push('/home');
    } catch (error) {
      console.error('Error leaving room:', error);
      enqueueSnackbar({
        variant: 'error',
        message: '방을 나가는데 실패했습니다.',
      });
    }
  };

  const sendMessage = ({ sender, text, type = 'chat' }: Message) => {
    if (!wsRef.current) {
      enqueueSnackbar({
        variant: 'error',
        message: '연결이 없습니다.',
      });
      return;
    }

    try {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ sender, text, type }));
      } else {
        enqueueSnackbar({
          variant: 'error',
          message: '연결이 끊어졌습니다. 다시 시도해주세요.',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      enqueueSnackbar({
        variant: 'error',
        message: '메시지 전송에 실패했습니다.',
      });
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
