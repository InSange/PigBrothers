import { Message } from '../_related/ChatProvider';
import {
  ChatContent,
  ChatImage,
  ChatInfoContainer,
  ChatName,
  UserChatBubble,
} from '../_related/session.styled';

const OtherUserChat = ({ message }: { message: Message }) => {
  return (
    <UserChatBubble>
      <ChatImage src={'/pig.svg'} />
      <ChatInfoContainer>
        <ChatName>유저 이름</ChatName>
        <ChatContent>상대방 채팅</ChatContent>
      </ChatInfoContainer>
    </UserChatBubble>
  );
};

export default OtherUserChat;
