import { Message } from '../_related/ChatProvider';
import {
  ChatContent,
  ChatImage,
  ChatInfoContainer,
  ChatName,
  MyChatBubble,
} from '../_related/session.styled';

const MyChat = ({ message }: { message: Message }) => {
  return (
    <MyChatBubble>
      <ChatImage src={'/pig.svg'} />
      <ChatInfoContainer>
        <ChatName>내 이름</ChatName>
        <ChatContent>내 채팅</ChatContent>
      </ChatInfoContainer>
    </MyChatBubble>
  );
};

export default MyChat;
