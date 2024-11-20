import React from 'react';
import { AlignCenterRowStack } from '../_components/common';
import RoomList from './_sections/RoomList';
import CreateRoomButton from './_sections/CreateRoomButton';

const page = () => {
  return (
    <div>
      <CreateRoomButton />
      <RoomList />
    </div>
  );
};

export default page;
