'use client';
import { AlignCenterRowStack } from '@/app/_components/common';
import { useContext } from 'react';
import { ChatContext, User } from '../_related/ChatProvider';
import {
  UserCard,
  UserImage,
  UserName,
  VoteImage,
} from '../_related/session.styled';

export const UserComponent = ({ user }: { user: User }) => {
  const { handleChangeUserMemo, isLiar, canVote, votedId } =
    useContext(ChatContext);
  const { Name, UserID, memo } = user ?? {};
  const isWolf = memo === 'wolf';
  const isCurrentUserVoted = votedId === UserID;

  return (
    <UserCard>
      <UserImage
        onClick={() => handleChangeUserMemo(user.UserID)}
        src={isLiar || isWolf ? '/wolf.png' : '/pig.webp'}
      />
      <AlignCenterRowStack style={{ gap: '4px' }}>
        <UserName>{Name}</UserName>
        {canVote && <VoteImage src='/Box.svg' />}
        {!canVote && isCurrentUserVoted && <VoteImage src='/check.svg' />}
      </AlignCenterRowStack>
    </UserCard>
  );
};
