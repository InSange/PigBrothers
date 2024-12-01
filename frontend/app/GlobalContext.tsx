'use client';
import { createContext, PropsWithChildren, useMemo, useState } from 'react';

type ContextType = {
  user?: { id: string; name: string };
  handleChangeUser: (name: ContextType['user']) => void;
};
export const GlobalContext = createContext<ContextType>({
  handleChangeUser: (_: ContextType['user']) => {},
});

export const GlobalContextProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<ContextType['user']>();

  const handleChangeUser = (user: ContextType['user']) => {
    setUser(user);
  };

  const contextValue = useMemo(() => ({ user, handleChangeUser }), [user]);

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};
