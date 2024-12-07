'use client';

import { useGetRoomStatusFirebaseRoomRoomIdGet } from '@/app/api/room/hooks/useQueryRoom';
import { GlobalContext } from '@/app/GlobalContext';
import { ALERT, CHAT, PROCESS, ROLE, STATE } from '@/constant';
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
import { Message } from './type';

interface ChatContextType {
  messages: Message[];
  sendMessage: ({}: {
    userID: string;
    text: string;
    type: Message['type'];
  }) => void;
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
  const [messages, setMessages] = useState<ChatContextType['messages']>([]);
  const { userId } = useContext(GlobalContext);
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [canVote, setCanVote] = useState(false);
  const [canKill, setCanKill] = useState(false);
  const [subject, setSubject] = useState<string | null>(null);
  const [isLiar, setIsLiar] = useState<boolean>(false);
  const [currentUserList, setCurrentUserList] = useState<User[]>([]);
  const [background, setBackground] = useState<
    'start' | 'dayTime' | 'night' | 'vote' | 'end'
  >();
  const { data: currentRoom } = useGetRoomStatusFirebaseRoomRoomIdGet({
    roomId,
    isConnecting,
  });
  const isGameStarted = currentRoom?.RoomState;

  useEffect(() => {
    if (!roomId || !userId || isConnecting || wsRef.current) return;

    const connectWebSocket = () => {
      setIsConnecting(true);

      if (!isGameStarted) {
        setCanSpeak(true);
      }

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

          if (message.type === CHAT || message.type === ALERT) {
            setMessages((prev: Message[]) => [...(prev ?? []), message]);
          } else if (message.type === STATE) {
            setCanSpeak(message.speak);
          } else if (message.type === ROLE) {
            setIsLiar(message.role === 'wolf');
            setSubject(message.word);
          } else if (message.type === PROCESS) {
            if (message.state === 'start') {
              setBackground('start');
              setCanSpeak(false);
            }
            if (message.state === 'dayTime') {
              setBackground('dayTime');
            }
            if (message.state === 'vote') {
              setBackground('vote');
              setCanSpeak(false);
              setCanVote(true);
            }
            if (message.state === 'night') {
              setBackground('night');
              isLiar && setCanKill(true);
            }
            if (message.state === 'end') {
              setBackground('end');
            }
          }
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

  const sendMessage: ChatContextType['sendMessage'] = ({
    userID,
    text,
    type = CHAT,
  }) => {
    if (!wsRef.current) {
      enqueueSnackbar({
        variant: 'error',
        message: '연결이 없습니다.',
      });
      return;
    }

    try {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ userID, text, type }));
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
