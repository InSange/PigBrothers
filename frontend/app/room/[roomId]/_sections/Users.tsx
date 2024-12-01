'use client';
import { AlignCenterRowStack } from '@/app/_components/common';
import User from './User';

const Users = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <AlignCenterRowStack style={{ gap: '8px' }}>
        <User />
        <User />
        <User />
        <User />
        <User />
      </AlignCenterRowStack>
      <AlignCenterRowStack style={{ gap: '8px' }}>
        <User />
        <User />
        <User />
        <User />
        <User />
      </AlignCenterRowStack>
    </div>
  );
};

export default Users;
