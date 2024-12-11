'use client';

import { useGetRoomStatusFirebaseRoomRoomIdGet } from '@/app/api/room/hooks/useQueryRoom';
import { GlobalContext } from '@/app/GlobalContext';
import { ALERT, CHAT, LEAVE, ROOM_INFO } from '@/constant';
import { RoomModel, UserModel } from '@/types/Api';
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
  currentUserList: User[];
  handleChangeUserMemo: (userID: string) => void;
  roomInfo: RoomModel | null;
}

export interface User extends UserModel {
  memo: 'wolf' | 'pig';
}

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: () => {},
  handleLeaveRoom: async () => {},
  currentUserList: [],
  handleChangeUserMemo: () => {},
  roomInfo: null,
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatContextType['messages']>([]);
  const { userId } = useContext(GlobalContext);
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { data: currentRoom } = useGetRoomStatusFirebaseRoomRoomIdGet({
    roomId,
    isConnecting,
  });
  const [currentUserList, setCurrentUserList] = useState<User[]>([]);
  const [roomInfo, setRoomInfo] = useState<RoomModel | null>(null);

  useEffect(() => {
    if (!roomId || !userId || isConnecting || wsRef.current) return;

    const connectWebSocket = () => {
      setIsConnecting(true);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        setIsConnecting(false);
        return;
      }

      wsRef.current = new WebSocket(
        // `ws://localhost:8000/ws/room/${roomId}/${userId}`
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
          } else if (message.type === ROOM_INFO) {
            setRoomInfo(message.room);
            const updatedUserList = message?.room?.UserList?.map((newUser) => {
              // 현재 유저 리스트에 이 유저가 있는지 확인
              const existingUser = currentUserList.find(
                (user) => user.UserID === newUser.UserID
              );

              // 유저가 있으면 그대로 반환
              if (existingUser) {
                return existingUser;
              }

              // 없다면 'pig'의 역할로 추가
              return {
                ...newUser,
                memo: 'pig' as 'pig',
              };
            });

            setCurrentUserList(updatedUserList ?? []);
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
  }, [roomId, userId, isConnecting, currentRoom]);

  const handleChangeUserMemo: ChatContextType['handleChangeUserMemo'] = (
    userID
  ) => {
    setCurrentUserList((prev) =>
      prev.map((user) =>
        user.UserID === userID
          ? { ...user, memo: user.memo === 'pig' ? 'wolf' : 'pig' }
          : user
      )
    );
  };

  const handleLeaveRoom = async () => {
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }

    try {
      if (wsRef.current) {
        wsRef.current.send(
          JSON.stringify({ userID: userId, type: LEAVE, text: '' })
        );
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
      handleChangeUserMemo,
      currentUserList,
      roomInfo,
    }),
    [messages, currentUserList, roomInfo]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
