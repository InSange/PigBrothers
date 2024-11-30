'use client';
import Button from '@/app/_components/Button';
import { StyledLink } from '@/app/_components/common';
import React from 'react';

const JoinRoomButton = () => {
  return (
    <StyledLink style={{ width: '100%' }} href={'/room'}>
      <Button>게임하러 가기</Button>
    </StyledLink>
  );
};

export default JoinRoomButton;
