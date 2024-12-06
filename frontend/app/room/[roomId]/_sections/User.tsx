'use client';
import { useState } from 'react';
import { UserCard, UserImage, UserName } from '../_related/session.styled';

const User = ({ user }: { user: { userId: string; name: string } }) => {
  const [isLiarMemo, setIsLiarMemo] = useState(false);
  const handleToggleMemo = () => {
    setIsLiarMemo((prevMemo) => !prevMemo);
  };

  return (
    <>
      {isLiarMemo ? (
        <UserCard onClick={handleToggleMemo}>
          <UserImage src={'/wolf.png'} />
          <UserName>{user.name}</UserName>
        </UserCard>
      ) : (
        <UserCard onClick={handleToggleMemo}>
          <UserImage src={'/pig.png'} />
          <UserName>{user.name}</UserName>
        </UserCard>
      )}
    </>
  );
};

export default User;
