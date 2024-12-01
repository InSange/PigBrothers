'use client';

import Button from '@/app/_components/Button';
import { useJoinRoomFirebaseRoomRoomIdJoinPut } from '@/app/api/room/hooks/useMutationSession';
import { GlobalContext } from '@/app/GlobalContext';
import { RoomModel } from '@/types/Api';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useContext } from 'react';
import {
  PersonCount,
  PersonCountContainer,
  RoomLeftContainer,
  RoomListStyled,
  RoomRightContainer,
  RoomTitle,
} from '../_related/room.styled';

const RoomList = ({ room }: { room: RoomModel }) => {
  const { userId } = useContext(GlobalContext);
  const router = useRouter();
  const { mutateAsync: joinRoom } = useJoinRoomFirebaseRoomRoomIdJoinPut();

  if (!room) return;

  const handleJoinRoom = () => {
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }

    joinRoom({
      query: {
        user_id: userId,
      },
      roomId: room.RoomID,
    }).then(() => {
      router.push(`/room/${room.RoomID}`);
    });
  };

  return (
    <RoomListStyled>
      <RoomLeftContainer>
        <RoomTitle>{room.Name}</RoomTitle>
      </RoomLeftContainer>
      <RoomRightContainer>
        <PersonCountContainer>
          <PersonCount>{room.UserList?.length ?? 0}</PersonCount>
          <PersonCount>/</PersonCount>
          <PersonCount>{room.MaxUser}</PersonCount>
        </PersonCountContainer>
        <Button size='small' onClick={handleJoinRoom}>
          참가
        </Button>
      </RoomRightContainer>
    </RoomListStyled>
  );
};

export default RoomList;
