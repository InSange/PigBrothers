import { GlobalContext } from '@/app/GlobalContext';
import { useContext, useEffect, useRef } from 'react';
import { ChatContext } from '../_related/ChatProvider';
import {
  ChattingContainer,
  ChattingContainerTitle,
} from '../_related/session.styled';
import MyChat from './MyChat';
import OtherUserChat from './OtherUserChat';

const Chatting = () => {
  const { messages } = useContext(ChatContext);
  const { userId } = useContext(GlobalContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새로운 메시지가 추가되면 스크롤을 최신 메시지로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages) {
    throw new Error('ChatMessageList must be used within a ChatProvider');
  }

  console.log(messages);

  return (
    <ChattingContainer style={{ overflow: 'auto' }}>
      <ChattingContainerTitle>채팅창</ChattingContainerTitle>
      <div>
        {messages?.map((message, i) => {
          console.log(message);
          const isMe = message.sender === userId;
          return (
            <div key={i}>
              {isMe ? (
                <MyChat message={message} />
              ) : (
                <OtherUserChat message={message} />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ChattingContainer>
  );
};

export default Chatting;
