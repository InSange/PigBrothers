import React from 'react';
import { StyledLink } from '../_components/common';
import JoinRoomButton from './_sections/JoinRoomButton';

const page = () => {
  return (
    <div>
      <div>이미지 캐러셸</div>
      <input type='text' />
      <JoinRoomButton />
    </div>
  );
};

export default page;
