'use client';
import { UserModel } from '@/types/Api';
import { useState } from 'react';
import { UserCard, UserImage, UserName } from '../_related/session.styled';

const User = ({ user }: { user: UserModel }) => {
  const [isLiarMemo, setIsLiarMemo] = useState(false);
  const handleToggleMemo = () => {
    setIsLiarMemo((prevMemo) => !prevMemo);
  };

  return (
    <>
      {isLiarMemo ? (
        <UserCard onClick={handleToggleMemo}>
          <UserImage src={'/wolf.png'} />
          <UserName>{user.Name}</UserName>
        </UserCard>
      ) : (
        <UserCard onClick={handleToggleMemo}>
          <UserImage src={'/pig.png'} />
          <UserName>{user.Name}</UserName>
        </UserCard>
      )}
    </>
  );
};

export default User;
