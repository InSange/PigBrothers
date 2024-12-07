'use client';
import { AlignCenterRowStack } from '@/app/_components/common';
import { useGetRoomStatusFirebaseRoomRoomIdGet } from '@/app/api/room/hooks/useQueryRoom';
import { UserModel } from '@/types/Api';
import { useParams } from 'next/navigation';
import { UserCard, UserImage } from '../_related/session.styled';
import User from './User';

const Users = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: currentRoom } = useGetRoomStatusFirebaseRoomRoomIdGet({
    roomId,
  });
  const currentUsers = currentRoom?.UserList ?? [];

  const MAX_USERS = 8;
  const USERS_PER_ROW = 4;

  const remainingSlots = MAX_USERS - currentUsers.length;
  const allSlots: UserModel[] = [
    ...currentUsers,
    ...Array(remainingSlots).fill(null),
  ];

  const userRows = Array.from(
    { length: Math.ceil(allSlots.length / USERS_PER_ROW) },
    (_, rowIndex) =>
      allSlots.slice(rowIndex * USERS_PER_ROW, (rowIndex + 1) * USERS_PER_ROW)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {userRows.map((row, rowIndex) => (
        <AlignCenterRowStack key={rowIndex} style={{ gap: '8px' }}>
          {row.map((user, userIndex) =>
            user ? (
              <User key={userIndex} user={user} />
            ) : (
              <UserCard key={userIndex}>
                <UserImage src={'/x.png'} />
              </UserCard>
            )
          )}
        </AlignCenterRowStack>
      ))}
    </div>
  );
};

export default Users;
