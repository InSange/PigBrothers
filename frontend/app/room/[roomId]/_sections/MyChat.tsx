import { useGetRoomStatusFirebaseRoomRoomIdGet } from '@/app/api/room/hooks/useQueryRoom';
import { useParams } from 'next/navigation';
import { Message } from '../_related/ChatProvider';
import {
  ChatContent,
  ChatImage,
  ChatInfoContainer,
  ChatName,
  MyChatBubble,
} from '../_related/session.styled';

const MyChat = ({ message }: { message: Message }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: currentRoom } = useGetRoomStatusFirebaseRoomRoomIdGet({
    roomId,
  });

  const user = currentRoom?.UserList?.find(
    (user) => user.UserID === message.userID
  );

  return (
    <MyChatBubble>
      <ChatImage src={'/pig.png'} />
      <ChatInfoContainer>
        <ChatName>{user?.Name}</ChatName>
        <ChatContent>{message.text}</ChatContent>
      </ChatInfoContainer>
    </MyChatBubble>
  );
};

export default MyChat;
