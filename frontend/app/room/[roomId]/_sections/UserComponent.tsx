'use client';
import { AlignCenterRowStack } from '@/app/_components/common';
import { GlobalContext } from '@/app/GlobalContext';
import { UserModel } from '@/types/Api';
import { useContext } from 'react';
import { ChatContext } from '../_related/ChatProvider';
import {
  UserCard,
  UserImage,
  UserName,
  VoteImage,
} from '../_related/session.styled';

export const UserComponent = ({ user }: { user: UserModel }) => {
  const { votedId, handleVote, handleKill, roomInfo, gameInfo, background } =
    useContext(ChatContext);
  const { userId: myId } = useContext(GlobalContext);
  const { Name, UserID } = user ?? {};
  const isMe = UserID === myId;
  const isUserSelected = votedId === UserID;
  const isDied = gameInfo?.dead_player.includes(UserID);
  const isMeDied = gameInfo?.dead_player.includes(myId!);
  /** 라이어인 유저인가? */
  const isLiar = gameInfo?.wolf === UserID;
  /** 나도 살아있고, 상대방도 살아있는가? */
  const notDiedPerson = !isMeDied && !isDied;
  /** 내가 라이어인가? */
  const isMeLiar = gameInfo?.wolf === myId;
  /** 죽일 수 있음 */
  const canKill =
    notDiedPerson &&
    isMeLiar &&
    !isUserSelected &&
    background?.state === 'night';
  /** 투표 할 수 있음 */
  const canVote =
    notDiedPerson && !isUserSelected && background?.state === 'vote';
  /** 투표를 했거나, 죽일 사람을 선택했는가? */
  const isSelectedComplete = notDiedPerson && isUserSelected;

  return (
    <UserCard>
      {isDied ? (
        <UserImage src={'/died.jpeg'} />
      ) : (
        <UserImage src={isLiar && isMe ? '/wolf.png' : '/pig.webp'} />
      )}
      <AlignCenterRowStack style={{ gap: '4px' }}>
        <UserName dark={gameInfo?.process === 'night'}>
          {roomInfo?.RoomHostID === user.UserID ? `👑 ${Name}` : Name}
        </UserName>
        {canVote && (
          <VoteImage onClick={() => handleVote(UserID)} src='/Box.svg' />
        )}
        {canKill && (
          <VoteImage onClick={() => handleKill(UserID)} src='/knife.svg' />
        )}
        {isSelectedComplete && <VoteImage src='/check.svg' />}
      </AlignCenterRowStack>
    </UserCard>
  );
};
