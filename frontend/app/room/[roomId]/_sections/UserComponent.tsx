'use client';
import { useContext } from 'react';
import { ChatContext, User } from '../_related/ChatProvider';
import { UserCard, UserImage, UserName } from '../_related/session.styled';

export const UserComponent = ({ user }: { user: User }) => {
  const { handleChangeUserMemo } = useContext(ChatContext);
  const { Name, UserID, memo } = user ?? {};
  const isWolf = memo === 'wolf';

  return (
    <UserCard onClick={() => handleChangeUserMemo(user.UserID)}>
      <UserImage src={isWolf ? '/wolf.png' : '/pig.png'} />
      <UserName>{Name}</UserName>
    </UserCard>
  );
};
