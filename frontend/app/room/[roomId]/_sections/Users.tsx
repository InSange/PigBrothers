'use client';
import { AlignCenterRowStack } from '@/app/_components/common';
import { useGetRoomStatusFirebaseRoomRoomIdGet } from '@/app/api/room/hooks/useQueryRoom';
import { useParams } from 'next/navigation';
import User from './User';

const Users = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: currentUsers } = useGetRoomStatusFirebaseRoomRoomIdGet({
    roomId,
  });

  // currentUsers를 4명씩 그룹으로 나누기
  const userRows = currentUsers
    ? Array.from(
        { length: Math.ceil(currentUsers.length / 4) },
        (_, rowIndex) => currentUsers.slice(rowIndex * 4, (rowIndex + 1) * 4)
      )
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {userRows.map((row, rowIndex) => (
        <AlignCenterRowStack key={rowIndex} style={{ gap: '8px' }}>
          {row.map((user, userIndex) => (
            <User key={userIndex} user={user} />
          ))}
        </AlignCenterRowStack>
      ))}
    </div>
  );
};

export default Users;
