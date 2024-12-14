'use client';
import { createContext, PropsWithChildren, useMemo, useState } from 'react';

type ContextType = {
  userId?: string;
  handleChangeUser: (name: ContextType['userId']) => void;
  handleLogout: () => void;
  roomName?: string;
  handleChangeRoomName: (name: ContextType['roomName']) => void;
};
export const GlobalContext = createContext<ContextType>({
  handleChangeUser: (_: ContextType['userId']) => {},
  handleLogout: () => {},
  handleChangeRoomName: (_: ContextType['roomName']) => {},
});

export const GlobalContextProvider = ({ children }: PropsWithChildren) => {
  // localStorage에서 초기값 가져오기
  const getUserFromLocalStorage = (): ContextType['userId'] | undefined => {
    if (typeof window === 'undefined') return ''; // 서버 렌더링 방지
    try {
      const savedUser = localStorage.getItem(window.location.hostname + 'user');
      return savedUser ? savedUser : '';
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      return undefined;
    }
  };

  const [userId, setUserId] = useState<ContextType['userId']>(() => {
    return getUserFromLocalStorage();
  });
  const [roomName, setRoomName] = useState<ContextType['roomName']>();

  const handleChangeUser = (newUser: ContextType['userId']) => {
    localStorage.setItem(window.location.hostname + 'user', newUser!);
    setUserId(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem(window.location.hostname + 'user');
    setUserId(undefined);
  };

  const handleChangeRoomName = (newRoomName: ContextType['roomName']) => {
    setRoomName(newRoomName);
  };

  const contextValue = useMemo(
    () => ({
      userId,
      handleChangeUser,
      handleLogout,
      roomName,
      handleChangeRoomName,
    }),
    [userId, roomName]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};
