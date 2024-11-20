import { StyledLink } from '@/app/_components/common';
import React from 'react';
import BackButton from './_sections/BackButton';
import Users from './_sections/Users';

const page = () => {
  return (
    <div>
      <BackButton />
      <Users />
    </div>
  );
};

export default page;
