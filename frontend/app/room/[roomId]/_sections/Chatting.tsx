import {
  Chat,
  ChatImage,
  ChatInfoContainer,
  ChatName,
  ChattingContainer,
  ChattingContainerTitle,
  MyChatBubble,
  UserChatBubble,
} from '../_related/session.styled';

const Chatting = () => {
  return (
    <ChattingContainer>
      <ChattingContainerTitle>채팅창</ChattingContainerTitle>
      <UserChatBubble>
        <ChatImage src={'/pig.svg'} />
        <ChatInfoContainer>
          <ChatName>유저 이름</ChatName>
          <Chat>상대방 채팅</Chat>
        </ChatInfoContainer>
      </UserChatBubble>
      <MyChatBubble>
        <ChatImage src={'/pig.svg'} />
        <ChatInfoContainer>
          <ChatName>내 이름</ChatName>
          <Chat>내 채팅</Chat>
        </ChatInfoContainer>
      </MyChatBubble>
    </ChattingContainer>
  );
};

export default Chatting;
