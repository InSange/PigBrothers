'use client';
import React, { useState } from 'react';
import { UserCard } from '../_related/session.styled';

const User = () => {
  const [isLiarMemo, setIsLiarMemo] = useState(false);
  const handleToggleMemo = () => {
    setIsLiarMemo((prevMemo) => !prevMemo);
  };

  return (
    <>
      {isLiarMemo ? (
        <UserCard onClick={handleToggleMemo}>늑대</UserCard>
      ) : (
        <UserCard onClick={handleToggleMemo}>돼지</UserCard>
      )}
    </>
  );
};

export default User;
