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
      <ChatImage src={'/pig.png'} />
      <ChatInfoContainer>
        <ChatName>{message.sender}</ChatName>
        <ChatContent>{message.text}</ChatContent>
      </ChatInfoContainer>
    </UserChatBubble>
  );
};

export default OtherUserChat;
