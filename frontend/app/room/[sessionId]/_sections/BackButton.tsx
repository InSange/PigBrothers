'use client';
import { StyledLink } from '@/app/_components/common';
import React from 'react';

const BackButton = () => {
  return (
    <StyledLink href='/room'>
      <button>나가기 버튼</button>
    </StyledLink>
  );
};

export default BackButton;
