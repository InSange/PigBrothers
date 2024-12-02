import { ContentContainer } from '@/app/_components/globalstyles';
import styled from 'styled-components';

export const SessionContentContainer = styled(ContentContainer)`
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const UserCard = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  height: 10vh;
  gap: 8px;
  min-height: 80px;
`;

export const UserName = styled.div`
  font-size: 16px;
  color: #000;
`;

export const UserImage = styled.img`
  width: 80%;
  height: 8vh;
  padding: 16px;
  background-color: #fff;
  border-radius: 999999px;
  min-height: 70px;
`;

export const ChattingContainer = styled.div`
  padding: 12px;
  background-color: #fff0f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

export const ChattingContainerTitle = styled.div`
  color: #000;
  font-weight: bold;
`;

export const ChatBubble = styled.div`
  border-radius: 16px;
  border: ${({ theme }) => `1px solid ${theme.colors.primary}`};
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
`;
export const UserChatBubble = styled(ChatBubble)`
  padding: 8px 8px;
`;
export const MyChatBubble = styled(ChatBubble)`
  margin-left: auto;
  padding: 8px;
`;
export const ChatInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
export const ChatName = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: #000;
`;
export const ChatImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 99999999px;
`;
export const ChatContent = styled.div`
  font-size: 14px;
  color: #000;
`;
