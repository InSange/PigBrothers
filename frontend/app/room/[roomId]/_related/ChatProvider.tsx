'use client';

import { GlobalContext } from '@/app/GlobalContext';
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
  userID: string;
  text: string;
  type: MessageType;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (message: Message) => void;
  handleLeaveRoom: () => Promise<void>;
  canSpeak: boolean;
  canVote: boolean;
  subject: string | null;
  isLiar: boolean;
}

export interface User {
  userId: string;
  name: string;
  memo: 'wolf' | 'pig';
}

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: () => {},
  handleLeaveRoom: async () => {},
  canSpeak: false,
  canVote: false,
  subject: null,
  isLiar: false,
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { userId } = useContext(GlobalContext);
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [canVote, setCanVote] = useState(false);
  const [subject, setSubject] = useState<string | null>(null);
  const [isLiar, setIsLiar] = useState<boolean>(false);
  const [currentUserList, setCurrentUserList] = useState<User[]>([]);

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
          setMessages((prev: Message[]) => [...(prev ?? []), message]);
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

  const sendMessage = ({ userID: sender, text, type = 'chat' }: Message) => {
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
      canSpeak,
      canVote,
      subject,
      isLiar,
    }),
    [messages, canSpeak, canVote, subject, isLiar]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
