'use client';

import Button from '@/app/_components/Button';
import { useRouter } from 'next/navigation';
import {
  PersonCount,
  PersonCountContainer,
  RoomLeftContainer,
  RoomListStyled,
  RoomNumber,
  RoomRightContainer,
  RoomTitle,
} from '../_related/room.styled';

const RoomList = ({ room }: { room: any }) => {
  const router = useRouter();
  const handleJoinRoom = () => {
    router.push('/room/1');
  };

  return (
    <RoomListStyled>
      <RoomLeftContainer>
        <RoomNumber>{room.id}.</RoomNumber>
        <RoomTitle>{room.name}</RoomTitle>
      </RoomLeftContainer>
      <RoomRightContainer>
        <PersonCountContainer>
          <PersonCount>3</PersonCount>
          <PersonCount>/</PersonCount>
          <PersonCount>3</PersonCount>
        </PersonCountContainer>
        <Button size='small' onClick={handleJoinRoom}>
          참가
        </Button>
      </RoomRightContainer>
    </RoomListStyled>
  );
};

export default RoomList;
