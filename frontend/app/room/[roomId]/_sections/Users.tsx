'use client';
import { AlignCenterRowStack } from '@/app/_components/common';
import { useContext } from 'react';
import { ChatContext, User } from '../_related/ChatProvider';
import { RoomTitle, UserCard, UserImage } from '../_related/session.styled';
import { UserComponent } from './UserComponent';

const Users = () => {
  const { currentUserList, roomInfo } = useContext(ChatContext);
  const MAX_USERS = 8;
  const USERS_PER_ROW = 4;

  const remainingSlots = MAX_USERS - currentUserList.length;
  const allSlots: User[] = [
    ...currentUserList,
    ...Array(remainingSlots).fill(null),
  ];

  const userRows = Array.from(
    { length: Math.ceil(allSlots.length / USERS_PER_ROW) },
    (_, rowIndex) =>
      allSlots.slice(rowIndex * USERS_PER_ROW, (rowIndex + 1) * USERS_PER_ROW)
  );

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <RoomTitle>{roomInfo?.Name}</RoomTitle>
      {userRows.map((row, rowIndex) => (
        <AlignCenterRowStack key={rowIndex} style={{ gap: '8px' }}>
          {row.map((user, userIndex) =>
            user ? (
              <UserComponent key={userIndex} user={user} />
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
