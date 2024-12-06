'use client';
import { RoomModel } from '@/types/Api';
import { useState } from 'react';
import { UserCard, UserImage, UserName } from '../_related/session.styled';

const User = ({ user }: { user: RoomModel }) => {
  const [isLiarMemo, setIsLiarMemo] = useState(false);
  const handleToggleMemo = () => {
    setIsLiarMemo((prevMemo) => !prevMemo);
  };

  return (
    <>
      {isLiarMemo ? (
        <UserCard onClick={handleToggleMemo}>
          <UserImage src={'/wolf.png'} />
          <UserName>늑대</UserName>
        </UserCard>
      ) : (
        <UserCard onClick={handleToggleMemo}>
          <UserImage src={'/pig.png'} />
          <UserName>돼지</UserName>
        </UserCard>
      )}
    </>
  );
};

export default User;
