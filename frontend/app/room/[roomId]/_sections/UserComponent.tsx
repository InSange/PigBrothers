'use client';
import { AlignCenterRowStack } from '@/app/_components/common';
import { useContext } from 'react';
import { ChatContext, User } from '../_related/ChatProvider';
import { UserCard, UserImage, UserName } from '../_related/session.styled';

export const UserComponent = ({ user }: { user: User }) => {
  const { handleChangeUserMemo, roomInfo } = useContext(ChatContext);
  const { Name, UserID } = user ?? {};

  return (
    <UserCard>
      <UserImage
        onClick={() => handleChangeUserMemo(user.UserID)}
        src={'/pig.webp'}
      />
      <AlignCenterRowStack style={{ gap: '4px' }}>
        <UserName>
          {roomInfo?.RoomHostID === UserID ? `👑 ${Name}` : Name}
        </UserName>
      </AlignCenterRowStack>
    </UserCard>
  );
};
