'use client';
import React from 'react';
import User from './User';
import { AlignCenterRowStack } from '@/app/_components/common';
import {
  Chat,
  ChatImage,
  ChatInfoContainer,
  ChatName,
  ChattingContainer,
  MyChatBubble,
  UserChatBubble,
} from '../_related/session.styled';

const Users = () => {
  return (
    <div>
      <AlignCenterRowStack>
        <User />
        <User />
        <User />
        <User />
        <User />
      </AlignCenterRowStack>
      <AlignCenterRowStack>
        <User />
        <User />
        <User />
        <User />
        <User />
      </AlignCenterRowStack>
      <button>게임 시작</button>
      <ChattingContainer>
        <div>채팅창</div>
        <UserChatBubble>
          <ChatImage src={'/pig.svg'} />
          <ChatInfoContainer>
            <ChatName>유저 이름</ChatName>
            <Chat>상대방 채팅</Chat>
          </ChatInfoContainer>
        </UserChatBubble>
        <MyChatBubble>
          <ChatImage src={'/pig.svg'} />
          <ChatInfoContainer>
            <ChatName>내 이름</ChatName>
            <Chat>내 채팅</Chat>
          </ChatInfoContainer>
        </MyChatBubble>
      </ChattingContainer>
      <input type='text' />
      <button>전송</button>
    </div>
  );
};

export default Users;
