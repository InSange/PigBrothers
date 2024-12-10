'use client';
import { AlignCenterRowStack } from '@/app/_components/common';
import { GlobalContext } from '@/app/GlobalContext';
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
    roomInfo,
    gameInfo,
  } = useContext(ChatContext);
  const { userId: myId } = useContext(GlobalContext);
  const { Name, UserID, memo } = user ?? {};
  const isWolf = memo === 'wolf';
  const isMe = UserID === myId;
  const isUserSelected = votedId === UserID;
  const isDied = gameInfo?.dead_player.includes(UserID);
  const isMeDied = gameInfo?.dead_player.includes(myId!);

  return (
    <UserCard>
      {isDied ? (
        <UserImage src={'/died.jpeg'} />
      ) : (
        <UserImage
          onClick={() => handleChangeUserMemo(user.UserID)}
          src={(isLiar && isMe) || isWolf ? '/wolf.png' : '/pig.webp'}
        />
      )}
      <AlignCenterRowStack style={{ gap: '4px' }}>
        <UserName>
          {roomInfo?.RoomHostID === user.UserID ? `👑 ${Name}` : Name}
        </UserName>
        {/* 투표 할 수 있음 */}
        {!isMeDied && !isDied && canVote && (
          <VoteImage onClick={() => handleVote(UserID)} src='/Box.svg' />
        )}
        {/* 죽일 수 있음 */}
        {!isMeDied && !isDied && canKill && (
          <VoteImage onClick={() => handleKill(UserID)} src='/knife.svg' />
        )}
        {/* 유저 선택 됨 : Kill or Vote */}
        {!isMeDied && !isDied && isUserSelected && (
          <VoteImage src='/check.svg' />
        )}
      </AlignCenterRowStack>
    </UserCard>
  );
};
