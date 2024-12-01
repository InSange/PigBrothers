'use client';
import { createContext, PropsWithChildren, useMemo } from 'react';

type ContextType = {
  userId?: string;
  handleChangeUser: (name: ContextType['userId']) => void;
  handleLogout: () => void;
};
export const GlobalContext = createContext<ContextType>({
  handleChangeUser: (_: ContextType['userId']) => {},
  handleLogout: () => {},
});

export const GlobalContextProvider = ({ children }: PropsWithChildren) => {
  // localStorage에서 초기값 가져오기
  const getUserFromLocalStorage = (): ContextType['userId'] | undefined => {
    if (typeof window === 'undefined') return undefined; // 서버 렌더링 방지
    try {
      const savedUser = localStorage.getItem(window.location.hostname + 'user');
      console.log(savedUser);
      return savedUser ? savedUser : undefined;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      return undefined;
    }
  };

  const userId = getUserFromLocalStorage();

  // 사용자가 변경될 때 localStorage에 저장
  const handleChangeUser = (newUser: ContextType['userId']) => {
    localStorage.setItem(window.location.hostname + 'user', newUser!);
  };

  const handleLogout = () => {
    localStorage.removeItem(window.location.hostname + 'user');
  };

  const contextValue = useMemo(
    () => ({ userId, handleChangeUser, handleLogout }),
    [userId]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};
