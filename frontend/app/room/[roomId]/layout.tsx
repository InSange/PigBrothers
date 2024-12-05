import { PropsWithChildren } from 'react';
import { ChatProvider } from './_related/ChatProvider';

const layout = ({ children }: PropsWithChildren) => {
  return <ChatProvider>{children}</ChatProvider>;
};

export default layout;
