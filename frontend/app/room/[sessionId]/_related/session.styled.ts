import { AlignCenterRowStack } from '@/app/_components/common';
import styled from 'styled-components';

export const UserCard = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  height: 200px;
  background-color: #c3f0f0;
  cursor: pointer;
`;
export const ChattingContainer = styled.div`
  padding: 12px;
`;
export const ChatBubble = styled.div`
  border-radius: 16px;
  border: 1px solid #000;
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
`;
export const UserChatBubble = styled(ChatBubble)``;
export const MyChatBubble = styled(ChatBubble)`
  background-color: #bebebe;
  margin-left: auto;
`;
export const ChatInfoContainer = styled.div``;
export const ChatName = styled.div``;
export const ChatImage = styled.img`
  border-radius: 99999999px;
`;
export const Chat = styled.div``;
