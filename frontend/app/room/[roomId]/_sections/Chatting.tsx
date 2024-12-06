import { GlobalContext } from '@/app/GlobalContext';
import { MANAGER } from '@/constant';
import { useContext, useEffect, useRef } from 'react';
import { ChatContext } from '../_related/ChatProvider';
import {
  Chats,
  ChattingContainer,
  ChattingContainerTitle,
} from '../_related/session.styled';
import HostChat from './HostChat';
import MyChat from './MyChat';
import OtherUserChat from './OtherUserChat';

const Chatting = () => {
  const { messages } = useContext(ChatContext);
  const { userId: myId } = useContext(GlobalContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새로운 메시지가 추가되면 스크롤을 최신 메시지로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages) {
    throw new Error('ChatMessageList must be used within a ChatProvider');
  }

  return (
    <ChattingContainer style={{ overflow: 'auto' }}>
      <ChattingContainerTitle>채팅창</ChattingContainerTitle>
      <Chats>
        {messages?.map((message, i) => {
          const isMe = message.userID === myId;
          const isHost = message.userID === MANAGER;
          return (
            <div key={i}>
              {isMe ? (
                <MyChat message={message} />
              ) : isHost ? (
                <HostChat message={message} />
              ) : (
                <OtherUserChat message={message} />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </Chats>
    </ChattingContainer>
  );
};

export default Chatting;
