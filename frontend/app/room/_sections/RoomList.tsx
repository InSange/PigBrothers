'use client';

import Button from '@/app/_components/Button';
import { GlobalContext } from '@/app/GlobalContext';
import { RoomModel } from '@/types/Api';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useContext } from 'react';
import {
  PersonCount,
  PersonCountContainer,
  RoomListStyled,
  RoomRightContainer,
  RoomTitle,
} from '../_related/room.styled';

const RoomList = ({ room }: { room: RoomModel }) => {
  const { userId } = useContext(GlobalContext);
  const router = useRouter();

  if (!room) return;

  const handleJoinRoom = () => {
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }

    router.push(`/room/${room.RoomID}`);
  };

  return (
    <RoomListStyled>
      <RoomTitle>{room.Name}</RoomTitle>
      <RoomRightContainer>
        <PersonCountContainer>
          <PersonCount>{room.UserList?.length ?? 0}</PersonCount>
          <PersonCount>/</PersonCount>
          <PersonCount>{room.MaxUser}</PersonCount>
        </PersonCountContainer>
        <Button
          style={{ width: 'fit-content' }}
          size='small'
          onClick={handleJoinRoom}
        >
          참가
        </Button>
      </RoomRightContainer>
    </RoomListStyled>
  );
};

export default RoomList;
