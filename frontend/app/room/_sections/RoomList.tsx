'use client';

import { AlignCenterRowStack } from '@/app/_components/common';
import React from 'react';
import { RoomContainer } from '../_related/room.styled';
import { useRouter } from 'next/navigation';

const RoomList = () => {
  const router = useRouter();
  const handleJoinRoom = () => {
    router.push('/room/1');
  };

  return (
    <AlignCenterRowStack>
      <div>방 제목 / 방장 / 방 이름</div>
      <button onClick={handleJoinRoom}>방 참여</button>
    </AlignCenterRowStack>
  );
};

export default RoomList;
