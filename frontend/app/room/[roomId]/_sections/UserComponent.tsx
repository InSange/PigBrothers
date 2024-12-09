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
  const {
    handleChangeUserMemo,
    isLiar,
    canVote,
    votedId,
    canKill,
    handleVote,
    handleKill,
  } = useContext(ChatContext);
  const { Name, UserID, memo } = user ?? {};
  const isWolf = memo === 'wolf';
  const isMe = UserID === user.UserID;
  const isUserSelected = votedId === UserID;

  return (
    <UserCard>
      <UserImage
        onClick={() => handleChangeUserMemo(user.UserID)}
        src={(isLiar && isMe) || isWolf ? '/wolf.png' : '/pig.webp'}
      />
      <AlignCenterRowStack style={{ gap: '4px' }}>
        <UserName>{Name}</UserName>
        {/* 투표 할 수 있음 */}
        {canVote && (
          <VoteImage onClick={() => handleVote(UserID)} src='/Box.svg' />
        )}
        {/* 죽일 수 있음 */}
        {canKill && (
          <VoteImage onClick={() => handleKill(UserID)} src='/knife.svg' />
        )}
        {/* 유저 선택 됨 : Kill or Vote */}
        {isUserSelected && <VoteImage src='/check.svg' />}
      </AlignCenterRowStack>
    </UserCard>
  );
};
