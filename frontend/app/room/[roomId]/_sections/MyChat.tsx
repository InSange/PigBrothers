import { useContext } from 'react';
import { ChatContext } from '../_related/ChatProvider';
import {
  ChatContent,
  ChatImage,
  ChatInfoContainer,
  ChatName,
  MyChatBubble,
} from '../_related/session.styled';
import { ChatMessage } from '../_related/type';

const MyChat = ({ message }: { message: ChatMessage }) => {
  const { roomInfo } = useContext(ChatContext);

  const user = roomInfo?.UserList?.find(
    (user) => user.UserID === message.userID
  );

  return (
    <MyChatBubble>
      <ChatImage src={'/pig.webp'} />
      <ChatInfoContainer>
        <ChatName>{user?.Name}</ChatName>
        <ChatContent>{message.text}</ChatContent>
      </ChatInfoContainer>
    </MyChatBubble>
  );
};

export default MyChat;
