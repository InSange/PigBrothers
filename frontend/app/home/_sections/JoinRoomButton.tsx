'use client';
import { StyledLink } from '@/app/_components/common';
import React from 'react';

const JoinRoomButton = () => {
  return (
    <StyledLink href={'/room'}>
      <button>게임하러 가기</button>
    </StyledLink>
  );
};

export default JoinRoomButton;
