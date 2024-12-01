'use client';
import { AlignCenterRowStack } from '@/app/_components/common';
import User from './User';

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
    </div>
  );
};

export default Users;
