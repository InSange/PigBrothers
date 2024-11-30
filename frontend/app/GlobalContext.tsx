'use client';
import { createContext, PropsWithChildren, useMemo, useState } from 'react';

type ContextType = {
  name?: string;
  handleChangeName: (name: string) => void;
};
export const GlobalContext = createContext<ContextType>({
  name: '',
  handleChangeName: (_: string) => {},
});

export const GlobalContextProvider = ({ children }: PropsWithChildren) => {
  const [name, setName] = useState<ContextType['name']>('');

  const handleChangeName = (name: string) => {
    setName(name);
  };

  const contextValue = useMemo(() => ({ name, handleChangeName }), [name]);

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};
