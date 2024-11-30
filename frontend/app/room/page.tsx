'use client';
import React from 'react';
import RoomList from './_sections/RoomList';
import CreateRoomButton from './_sections/CreateRoomButton';
import { Layout } from '../(root)/_related/root.styled';

const page = () => {
  return (
    <Layout>
      <CreateRoomButton />
      <RoomList />
    </Layout>
  );
};

export default page;
