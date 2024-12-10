import { AlignCenterRowStack } from '@/app/_components/common';
import { ContentContainer } from '@/app/_components/globalstyles';
import styled from 'styled-components';

export const RoomContainer = styled(AlignCenterRowStack)`
  justify-content: space-between;
`;

export const RoomContentContainer = styled(ContentContainer)`
  padding: 12px 20px;
`;

export const RoomTitleContainer = styled(AlignCenterRowStack)`
  gap: 12px;
`;

export const RoomListTitle = styled.h3`
  color: #000;
  font-size: 20px;
  line-height: 24px;
`;

export const CreateRoomButtonContainer = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 8px;
  width: 24px;
  height: 24px;
  color: #fff;
  cursor: pointer;
`;

export const RoomListStyled = styled.li`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;

  &:not(:last-child) {
    border-bottom: 1px solid #efefef;
  }
`;

export const RoomNumber = styled.h6`
  color: #000;
  font-size: 14px;
  margin: 0px;
  font-weight: 400;
`;

export const RoomTitle = styled.h6`
  color: #000;
  font-size: 14px;
  margin: 0px;
  font-weight: 400;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;
`;

export const RoomListContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 8px;
`;

export const RoomRightContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
`;

export const PersonCount = styled.span`
  color: #000;
  font-size: 14px;
  font-weight: 400;
`;

export const PersonCountContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2px;
`;
