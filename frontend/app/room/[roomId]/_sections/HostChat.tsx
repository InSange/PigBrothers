import { HostChatBubble } from '../_related/session.styled';
import { AlertMessage } from '../_related/type';

const HostChat = ({ message }: { message: AlertMessage }) => {
  return <HostChatBubble>{message.text}</HostChatBubble>;
};

export default HostChat;
