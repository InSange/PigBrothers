import { useContext } from 'react';
import { ChatContext } from '../_related/ChatProvider';
import {
  ChatContent,
  ChatImage,
  ChatInfoContainer,
  ChatName,
  UserChatBubble,
} from '../_related/session.styled';
import { ChatMessage } from '../_related/type';

const OtherUserChat = ({ message }: { message: ChatMessage }) => {
  const { roomInfo, gameInfo } = useContext(ChatContext);

  const user = roomInfo?.UserList?.find(
    (user) => user.UserID === message.userID
  );

  return (
    <UserChatBubble>
      <ChatImage src={'/pig.webp'} />
      <ChatInfoContainer>
        <ChatName dark={gameInfo?.process === 'night'}>{user?.Name}</ChatName>
        <ChatContent dark={gameInfo?.process === 'night'}>
          {message.text}
        </ChatContent>
      </ChatInfoContainer>
    </UserChatBubble>
  );
};

export default OtherUserChat;
