import { useGetRoomStatusFirebaseRoomRoomIdGet } from '@/app/api/room/hooks/useQueryRoom';
import { useParams } from 'next/navigation';
import {
  ChatContent,
  ChatImage,
  ChatInfoContainer,
  ChatName,
  UserChatBubble,
} from '../_related/session.styled';
import { ChatMessage } from '../_related/type';

const OtherUserChat = ({ message }: { message: ChatMessage }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: currentRoom } = useGetRoomStatusFirebaseRoomRoomIdGet({
    roomId,
  });
  const user = currentRoom?.UserList?.find(
    (user) => user.UserID === message.userID
  );

  return (
    <UserChatBubble>
      <ChatImage src={'/pig.png'} />
      <ChatInfoContainer>
        <ChatName>{user?.Name}</ChatName>
        <ChatContent>{message.text}</ChatContent>
      </ChatInfoContainer>
    </UserChatBubble>
  );
};

export default OtherUserChat;
