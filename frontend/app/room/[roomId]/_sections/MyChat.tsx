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
      <ChatImage src={'/pig.png'} />
      <ChatInfoContainer>
        <ChatName>{message.sender}</ChatName>
        <ChatContent>{message.text}</ChatContent>
      </ChatInfoContainer>
    </MyChatBubble>
  );
};

export default MyChat;
