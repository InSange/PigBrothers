import { Message } from '../_related/ChatProvider';
import { HostChatBubble } from '../_related/session.styled';

const HostChat = ({ message }: { message: Message }) => {
  return <HostChatBubble>{message.text}</HostChatBubble>;
};

export default HostChat;
